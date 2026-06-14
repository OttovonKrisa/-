/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, MapPin, ExternalLink } from 'lucide-react';
import { Station } from '../types';
import { motion } from 'motion/react';

interface DetailsModalProps {
  station: Station;
  onClose: () => void;
  theme: 'rosatom' | 'tpu';
}

export function DetailsModal({ station, onClose, theme }: DetailsModalProps) {
  // Generate highly aesthetic realistic specs for TPU vs Rosatom vs Joint
  const isRosatom = station.type === 'rosatom';
  const isTPU = station.type === 'tpu';
  const isJoint = station.type === 'joint';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-slate-300 rounded shadow-2xl w-full max-w-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] text-slate-800"
      >
        {/* Header decoration */}
        <div className={`h-2 w-full ${
          isRosatom 
            ? 'bg-[#00509A]' 
            : isTPU 
            ? 'bg-[#007A33]'
            : 'bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-600'
        }`} />

        {/* Padding Content */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-0.5 text-[10px] tracking-widest font-mono font-bold rounded uppercase ${
                  isRosatom 
                    ? 'bg-blue-50 text-[#00509A] border border-blue-200' 
                    : isTPU 
                    ? 'bg-emerald-50 text-[#007A33] border border-emerald-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {isRosatom ? 'ГК РОСАТОМ' : isTPU ? 'ТПУ' : 'СОВМЕСТНЫЙ ПРОЕКТ'}
                </span>
                {station.city && (
                  <span className="text-xs text-slate-500 font-mono flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {station.city}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 uppercase tracking-tight leading-tight pt-1">
                {station.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Map info banner */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 grid grid-cols-2 gap-4 text-center text-xs font-mono text-slate-600">
            <div className="border-r border-slate-200">
              <span className="text-slate-400 block font-bold">ШИРОТА (LAT):</span>
              <span className="text-[#00509A] font-bold text-sm">{station.lat.toFixed(6)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">ДОЛГОТА (LON):</span>
              <span className="text-[#00509A] font-bold text-sm">{station.lon.toFixed(6)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider">КРАТКОЕ СВЕДЕНИЕ</h3>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded border border-slate-200">
              {station.shortInfo}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider">ПОЛНАЯ ИНФОРМАЦИЯ И ХАРАКТЕРИСТИКИ</h3>
            <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line font-sans">
              {station.fullInfo}
            </p>
          </div>


        </div>

        {/* Footer info lockups */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 px-8 flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>СИСТЕМА КАРТОГРАФИИ TPU-ROSATOM v2.4</span>
          <span className="flex items-center hover:text-slate-800 font-bold transition-colors cursor-pointer" onClick={() => window.open('https://tpu.ru', '_blank')}>
            Перейти к ТПУ <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
