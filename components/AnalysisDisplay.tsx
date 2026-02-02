import React, { useState } from 'react';
import { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
  data: AnalysisResult;
}

type TabKey = keyof AnalysisResult;

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('Subject');

  const TabButton = ({ id, label }: { id: TabKey; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
        activeTab === id
          ? 'border-indigo-500 text-white'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-zinc-800 bg-zinc-950/30 overflow-x-auto scrollbar-hide">
            <TabButton id="Subject" label="Subject" />
            <TabButton id="Background" label="Background" />
            <TabButton id="Lighting" label="Lighting" />
            <TabButton id="Composition" label="Composition" />
            <TabButton id="Aesthetic" label="Aesthetic" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
            
            {activeTab === 'Subject' && (
                <div className="space-y-6 animate-fadeIn">
                    <section className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                        <h3 className="text-indigo-400 font-mono text-xs uppercase mb-2">Summary</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">{data.Subject.general_summary}</p>
                    </section>
                    
                    <div className="space-y-4">
                        {data.Subject.entities.map((entity, idx) => (
                            <div key={idx} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                <div className="flex items-center justify-between mb-3 border-b border-zinc-700 pb-2">
                                    <span className="text-white font-medium">Entity {idx + 1}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                                        entity.gender.toLowerCase().includes('female') ? 'bg-pink-500/10 text-pink-300' :
                                        entity.gender.toLowerCase().includes('male') ? 'bg-blue-500/10 text-blue-300' :
                                        'bg-purple-500/10 text-purple-300'
                                    }`}>
                                        {entity.gender}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <InfoBlock label="Appearance" value={entity.description} />
                                    <InfoBlock label="Apparel" value={entity.apparel} />
                                    <InfoBlock label="Pose" value={entity.pose} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'Background' && (
                <div className="space-y-6 animate-fadeIn">
                     <section className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                        <div className="mb-4">
                            <h3 className="text-indigo-400 font-mono text-xs uppercase mb-2">Location</h3>
                            <p className="text-zinc-200 text-lg font-light">{data.Background.location}</p>
                        </div>
                        <div>
                            <h3 className="text-zinc-500 font-mono text-xs uppercase mb-2">Description</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed">{data.Background.general_summary}</p>
                        </div>
                    </section>

                    <ListCard title="Key Elements" items={data.Background.elements} />
                </div>
            )}

            {activeTab === 'Lighting' && (
                <div className="space-y-6 animate-fadeIn">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Source" value={data.Lighting.source} />
                        <InfoCard label="Quality" value={data.Lighting.quality} />
                    </section>
                    <section className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase mb-2">Analysis</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">{data.Lighting.description}</p>
                    </section>
                </div>
            )}

            {activeTab === 'Composition' && (
                 <div className="space-y-6 animate-fadeIn">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Perspective" value={data.Composition.perspective} />
                        <InfoCard label="Framing" value={data.Composition.framing} />
                    </section>
                    <section className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase mb-2">Structure</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">{data.Composition.description}</p>
                    </section>
                 </div>
            )}

            {activeTab === 'Aesthetic' && (
                 <div className="space-y-6 animate-fadeIn">
                     <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard label="Style" value={data.Aesthetic.style} />
                        <InfoCard label="Mood" value={data.Aesthetic.mood} />
                    </section>
                    <section className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                        <h3 className="text-zinc-500 font-mono text-xs uppercase mb-2">Vibe Check</h3>
                        <p className="text-zinc-300 text-sm leading-relaxed">{data.Aesthetic.description}</p>
                    </section>
                 </div>
            )}

        </div>
    </div>
  );
};

// Helper Components

const InfoBlock = ({ label, value }: { label: string, value: string }) => (
    <div>
        <span className="text-xs text-zinc-500 uppercase tracking-wide block mb-1">{label}</span>
        <p className="text-sm text-zinc-300">{value}</p>
    </div>
);

const InfoCard = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-zinc-800 p-4 rounded border border-zinc-700/50">
        <p className="text-xs text-indigo-400 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm text-zinc-200 font-medium">{value}</p>
    </div>
);

const ListCard = ({ title, items }: { title: string, items: string[] }) => (
    <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
        <h4 className="text-xs text-zinc-500 uppercase mb-3">{title}</h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {items.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-zinc-300">
                    <span className="mr-2 text-indigo-500">•</span>
                    {item}
                </li>
            ))}
        </ul>
    </div>
);

export default AnalysisDisplay;
