
import React, { useState, useRef, useEffect } from 'react';
import { Patient, AudioTest, UserRole } from '../types';
import { mockStorage } from '../services/firebaseMock';

interface TestManagementProps {
  patient: Patient;
  tests: AudioTest[];
  userRole: UserRole;
  onTestAdded: (test: AudioTest) => void;
  onBack: () => void;
}

export const TestManagement: React.FC<TestManagementProps> = ({ patient, tests, userRole, onTestAdded, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AudioTest | null>(null);
  const [recordTime, setRecordTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = userRole === 'researcher';

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordTime(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    try {
      const testResult = await mockStorage.uploadAudio(blob, patient.id);
      onTestAdded(testResult);
      setSelectedTest(testResult);
    } catch (err) {
      console.error(err);
      alert("Error processing audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (isReadOnly) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        await processAudio(audioBlob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied. Check your browser permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert("Please upload a valid audio file.");
      return;
    }

    await processAudio(file);
    // Clear the input so the same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="text-slate-400 hover:text-slate-800 flex items-center gap-2 font-medium transition-colors">
        <span className="text-xl">←</span> Back to Patient Registry
      </button>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{patient.name}</h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{patient.id}</span>
                <span className="text-xs font-bold text-slate-500 border-l border-slate-200 pl-4">{patient.age} years old</span>
                <span className="text-xs font-bold text-slate-500 border-l border-slate-200 pl-4">{patient.gender}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isReadOnly && (
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="audio/*" 
                  className="hidden" 
                />
                
                {!isRecording ? (
                  <>
                    <button
                      disabled={isProcessing}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                      <span className="text-lg">📁</span>
                      Upload Audio
                    </button>
                    <button
                      disabled={isProcessing}
                      onClick={startRecording}
                      className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/20 disabled:opacity-50 group"
                    >
                      <div className="w-3 h-3 rounded-full bg-white group-hover:scale-125 transition-transform" />
                      Capture Live
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4 bg-rose-50 px-6 py-3 rounded-2xl border border-rose-100">
                    <div className="flex items-center gap-2 text-rose-600 font-bold tabular-nums">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse" />
                      {formatTime(recordTime)}
                    </div>
                    <button
                      onClick={stopRecording}
                      className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-500/10"
                    >
                      Analyze Now
                    </button>
                  </div>
                )}
              </div>
            )}
            {isReadOnly && (
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                READ-ONLY RESEARCHER ACCESS
              </span>
            )}
          </div>
        </div>

        {isProcessing && (
          <div className="mt-8 p-6 bg-indigo-50 rounded-2xl flex items-center gap-6 border border-indigo-100 animate-pulse">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="font-bold text-indigo-900 text-lg">Inference Engine Running...</p>
              <p className="text-sm text-indigo-700">Deconstructing speech prosody and articulation markers via Neural Audio Processor.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Test History */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Diagnostic History</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">{tests.length} Records</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-100">
            {tests.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">📁</div>
                <p className="text-slate-400 font-medium">No diagnostic tests found.</p>
                {!isReadOnly && <p className="text-xs text-slate-300 mt-1">Start a recording or upload a file to create the first record.</p>}
              </div>
            ) : (
              tests.map((test) => (
                <div 
                  key={test.id} 
                  onClick={() => setSelectedTest(test)}
                  className={`p-6 cursor-pointer hover:bg-slate-50/80 transition-all flex items-center justify-between group ${selectedTest?.id === test.id ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110 ${test.predictedLabel === 'Stroke' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {test.predictedLabel === 'Stroke' ? '⚠️' : '✅'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{new Date(test.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(test.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg ${test.predictedLabel === 'Stroke' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {test.predictedLabel}
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${test.predictedLabel === 'Stroke' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${test.strokeProbability * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 tracking-tighter">{(test.strokeProbability * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Test Detail */}
        <div className="lg:col-span-5">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit sticky top-24">
            {selectedTest ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800">Deep Analysis</h3>
                  <span className="text-[10px] font-mono text-slate-300 font-bold">{selectedTest.id}</span>
                </div>
                
                <div className="p-4 bg-slate-900 rounded-2xl shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">Source Audio</p>
                  <audio controls src={selectedTest.audioUrl} className="w-full invert opacity-90 h-10" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${selectedTest.predictedLabel === 'Stroke' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Diagnostic</p>
                    <p className={`text-xl font-black mt-1 ${selectedTest.predictedLabel === 'Stroke' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedTest.predictedLabel}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Stroke Prob.</p>
                    <p className="text-xl font-black text-slate-800 mt-1">
                      {(selectedTest.strokeProbability * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Acoustic Biomarkers Display */}
                <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest border-b border-slate-200 pb-2">Acoustic Biomarkers</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Jitter (Instability)</span>
                      <span className={`font-mono font-black ${selectedTest.biomarkers.jitter > 1.04 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {selectedTest.biomarkers.jitter.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Shimmer (Amplitude)</span>
                      <span className={`font-mono font-black ${selectedTest.biomarkers.shimmer > 3.81 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {selectedTest.biomarkers.shimmer.toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Harmonics Ratio (HNR)</span>
                      <span className={`font-mono font-black ${selectedTest.biomarkers.hnr < 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {selectedTest.biomarkers.hnr.toFixed(1)} dB
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Speaking Rate</span>
                      <span className={`font-mono font-black ${selectedTest.biomarkers.speakingRate < 3 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {selectedTest.biomarkers.speakingRate.toFixed(2)} syll/s
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${selectedTest.predictedLabel === 'Stroke' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Clinical Reasoning</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedTest.reasoning}
                  </p>
                </div>

                <div className="space-y-3">
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    Export Forensic Report
                  </button>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">
                    Model: {selectedTest.modelVersion} • {selectedTest.deviceType}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-300">
                <div className="text-4xl mb-4 opacity-20">📊</div>
                <p className="font-black uppercase tracking-widest text-[10px]">Analysis Preview</p>
                <p className="text-xs mt-2 font-medium">Select a diagnostic record to inspect neural biomarkers and vocal analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
