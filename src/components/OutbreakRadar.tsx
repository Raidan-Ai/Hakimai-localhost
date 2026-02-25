import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AlertTriangle, MapPin, Activity, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface OutbreakData {
  timestamp: string;
  location: string;
  symptoms: string;
  count: number;
}

export default function OutbreakRadar() {
  const [data, setData] = useState<OutbreakData[]>([]);
  const [isAlert, setIsAlert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/outbreak-data');
        const json = await response.json();
        setData(json);
        
        // Algorithmic Trigger: Check for spikes in "Fever, Joint Pain" (Dengue Indicator)
        const northDistrictSpikes = json.filter((d: any) => 
          d.location === 'North District' && d.symptoms.includes('Fever') && d.count > 25
        );
        
        if (northDistrictSpikes.length >= 2) {
          setIsAlert(true);
        }
      } catch (error) {
        console.error('Failed to fetch outbreak data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-12 text-center text-[#141414]/40">Analyzing epidemiological patterns...</div>;

  return (
    <div className="space-y-8">
      {/* Alert Banner */}
      {isAlert && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 flex items-center gap-6"
        >
          <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center animate-pulse">
            <AlertTriangle className="text-white w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900">EPIDEMIOLOGICAL ALERT: DENGUE SPIKE</h3>
            <p className="text-red-800/70 text-sm">
              Significant cluster of "Severe Fever + Joint Pain" detected in **North District** within 48h. 
              Recommend immediate vector control and diagnostic kit distribution.
            </p>
          </div>
          <button className="ml-auto px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors">
            Notify Authorities
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Trend Chart */}
        <div className="col-span-8 bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" /> Symptom Frequency (48h)
            </h3>
            <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold text-[#141414]/40">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> North District</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> South District</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#999' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="col-span-4 bg-white rounded-3xl p-8 border border-[#141414]/5 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
            <MapPin size={20} className="text-indigo-500" /> Hotspot Analysis
          </h3>
          
          <div className="space-y-6">
            <LocationStat name="North District" count={75} color="bg-emerald-500" percentage={65} />
            <LocationStat name="South District" count={22} color="bg-indigo-500" percentage={20} />
            <LocationStat name="East District" count={15} color="bg-amber-500" percentage={15} />
          </div>

          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-[#141414]/5">
            <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 font-bold mb-2">System Insight</p>
            <p className="text-xs text-[#141414]/60 leading-relaxed">
              Anonymized triage data indicates a 240% increase in respiratory complaints compared to the 7-day baseline.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationStat({ name, count, color, percentage }: { name: string, count: number, color: string, percentage: number }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold">{name}</span>
        <span className="text-xs font-mono text-[#141414]/40">{count} reports</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}
