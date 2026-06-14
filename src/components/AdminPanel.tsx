/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  KeyRound, Plus, Trash2, Upload, Download, CloudAlert, 
  Settings, Cloud, Layers, Calendar, HelpCircle, X, ShieldCheck
} from 'lucide-react';
import { Station } from '../types';
import { importFromExcel, exportToExcel } from '../utils/excel';

interface AdminPanelProps {
  stations: Station[];
  onAddStation: (station: Omit<Station, 'id' | 'createdAt'>) => void;
  onDeleteStation: (id: string) => void;
  onImportStations: (imported: Partial<Station>[]) => void;
  isFirebaseActive: boolean;
  onSyncWithCloud?: () => void;
  sleepStart: string;
  sleepEnd: string;
  onChangeSleepHours: (start: string, end: string) => void;
  onClose: () => void;
}

export function AdminPanel({
  stations,
  onAddStation,
  onDeleteStation,
  onImportStations,
  isFirebaseActive,
  onSyncWithCloud,
  sleepStart,
  sleepEnd,
  onChangeSleepHours,
  onClose
}: AdminPanelProps) {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Form states
  const [newStationName, setNewStationName] = useState('');
  const [newStationLat, setNewStationLat] = useState('');
  const [newStationLon, setNewStationLon] = useState('');
  const [newStationShort, setNewStationShort] = useState('');
  const [newStationFull, setNewStationFull] = useState('');
  const [newStationType, setNewStationType] = useState<'rosatom' | 'tpu' | 'joint'>('rosatom');
  const [newStationCity, setNewStationCity] = useState('');

  // Excel Upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [excelStatus, setExcelStatus] = useState<string>('');

  // Confirmation state for deleting a station
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '201721') {
      setIsUnlocked(true);
      setPasswordError('');
    } else {
      setPasswordError('Неверный код доступа. Попробуйте еще раз.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(newStationLat);
    const lon = parseFloat(newStationLon);

    if (!newStationName.trim()) return alert('Укажите название объекта');
    if (isNaN(lat) || lat < -90 || lat > 90) return alert('Укажите корректную широту (от -90 до 90)');
    if (isNaN(lon) || lon < -180 || lon > 180) return alert('Укажите корректную долготу (от -180 до 180)');

    onAddStation({
      name: newStationName,
      lat,
      lon,
      shortInfo: newStationShort || 'Информационный объект ТПУ — Росатом',
      fullInfo: newStationFull || 'Подробное описание готовится к публикации.',
      type: newStationType,
      city: newStationCity || 'Томск'
    });

    // Reset fields
    setNewStationName('');
    setNewStationLat('');
    setNewStationLon('');
    setNewStationShort('');
    setNewStationFull('');
    setNewStationCity('');
    alert('Новый объект успешно добавлен в базу данных!');
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setExcelStatus('Чтение таблицы...');
    try {
      const parsed = await importFromExcel(file);
      onImportStations(parsed);
      setExcelStatus(`Успешно импортировано объектов: ${parsed.length}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      setExcelStatus('Ошибка при парсинге Excel!');
    }
  };

  return (
    <div className="absolute top-0 left-0 bg-slate-900 text-slate-200 w-[380px] max-w-full h-full border-r border-slate-800 flex flex-col shadow-[10px_0_40px_rgba(0,0,0,0.5)] z-[990] overflow-hidden select-text font-sans">
      
      {/* Header element conforming to screenshot style but detailed */}
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-500" />
            <span>Панель управления</span>
          </h1>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
            Административный Терминал
          </span>
        </div>
        <button
          onClick={onClose}
          className="cursor-pointer text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-850 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {!isUnlocked ? (
          /* Password Form Gate corresponding to 201721 requirement */
          <form onSubmit={handleUnlock} className="space-y-4 pt-6 text-center">
            <div className="w-12 h-12 bg-blue-950/80 text-blue-500 rounded-2xl flex items-center justify-center mx-auto border border-blue-800 animate-pulse">
              <KeyRound className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white uppercase tracking-tight font-sans">Авторизация доступа</h2>
              <p className="text-xs text-slate-500 leading-relaxed px-4 font-sans">
                Введите ключ доступа для управления объектами интерактивной карты.
              </p>
            </div>

            <div className="space-y-2 px-2">
              <input
                type="password"
                placeholder="Ключ доступа"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-center text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-red-400 font-mono mt-1">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-mono font-bold tracking-widest transition-all shadow-md"
            >
              ПОДТВЕРДИТЬ ДОСТУП
            </button>
          </form>
        ) : (
          /* UNLOCKED CONTROLS PANEL */
          <>
            <div className="bg-emerald-950/30 border border-emerald-800/60 p-3 rounded-2xl flex items-center space-x-3 text-emerald-400 text-xs">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-500" />
              <div>
                <span className="font-bold block text-[11px] leading-3 text-white uppercase">ДОСТУП РАЗРЕШЕН</span>
                <span className="text-[10px] text-emerald-500/80">Редактирование карты разблокировано</span>
              </div>
            </div>

            {/* ADD OBJECT FORM : Corresponding exactly to reference image layout */}
            <form onSubmit={handleCreate} className="space-y-4 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest">Добавление объекта</h2>
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">Название станции / объекта</label>
                <input
                  type="text"
                  placeholder="Пример: Курская АЭС"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block uppercase">Широта (Lat)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="56.4977"
                    value={newStationLat}
                    onChange={(e) => setNewStationLat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-100"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 block uppercase">Долгота (Lon)</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="84.9744"
                    value={newStationLon}
                    onChange={(e) => setNewStationLon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500 text-slate-100"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">Город / Регион</label>
                <input
                  type="text"
                  placeholder="Томск"
                  value={newStationCity}
                  onChange={(e) => setNewStationCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">Принадлежность объекта</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewStationType('rosatom')}
                    className={`cursor-pointer text-[10px] font-bold py-1.5 rounded-lg transition-all ${
                      newStationType === 'rosatom'
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    РОСАТОМ
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStationType('tpu')}
                    className={`cursor-pointer text-[10px] font-bold py-1.5 rounded-lg transition-all ${
                      newStationType === 'tpu'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    ТПУ
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStationType('joint')}
                    className={`cursor-pointer text-[10px] font-bold py-1.5 rounded-lg transition-all ${
                      newStationType === 'joint'
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    СОВМЕСТ.
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">Краткое описание (для балуна)</label>
                <textarea
                  rows={2}
                  placeholder="Краткое описание на 1-2 предложения..."
                  value={newStationShort}
                  onChange={(e) => setNewStationShort(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 block uppercase">Полное описание (по кнопке "Подробнее")</label>
                <textarea
                  rows={3}
                  placeholder="Инженерные параметры, выработка энергии, кафедры обучения, ядерные установки..."
                  value={newStationFull}
                  onChange={(e) => setNewStationFull(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full bg-blue-700 hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-mono font-bold uppercase transition-colors flex items-center justify-center space-x-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить объект</span>
              </button>
            </form>

            {/* EXCEL ACTIONS INTEGRATION */}
            <div className="space-y-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Settings className="w-3.5 h-3.5 text-blue-500" />
                <span>Офлайн-перенос (USB Flash)</span>
              </h2>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Сохраняйте данные в таблицу Excel для оффлайн переноса на другие экраны вуза через флешку.
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-2 px-2 rounded-xl text-xs font-mono text-slate-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Импорт Excel</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls"
                  onChange={handleExcelUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => exportToExcel(stations)}
                  className="cursor-pointer bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 py-2 px-2 rounded-xl text-xs font-mono text-slate-300 transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Экспорт Excel</span>
                </button>
              </div>

              {excelStatus && (
                <div className="text-[10px] font-mono text-center text-amber-500 bg-amber-950/20 p-1.5 rounded-lg border border-amber-900/40">
                  {excelStatus}
                </div>
              )}
            </div>

            {/* CLOUD CONFIGURATION INTERFACE */}
            <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 space-y-3">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start space-x-1.5">
                <Cloud className="w-3.5 h-3.5 text-indigo-500" />
                <span>Синхронизация с облаком</span>
              </h2>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">СТАТУС ОБЛАКА:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isFirebaseActive 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {isFirebaseActive ? 'ПОДКЛЮЧЕНО' : 'ОФЛАЙН РЕЖИМ'}
                </span>
              </div>

              {isFirebaseActive ? (
                <button
                  type="button"
                  onClick={onSyncWithCloud}
                  className="cursor-pointer w-full bg-indigo-700 hover:bg-indigo-600 text-white/90 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center space-x-1"
                >
                  <CloudAlert className="w-3.5 h-3.5 animate-bounce" />
                  <span>Синхронизировать сейчас</span>
                </button>
              ) : (
                <p className="text-[10px] text-slate-600 leading-normal font-mono">
                  Удаленное обновление контента заработает автоматически, как только вы примите и подпишите условия Firebase в панели AI Studio.
                </p>
              )}
            </div>

            {/* SLEEP HOURS CONTROL CONFIG */}
            <div className="space-y-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>Энергосбережение</span>
              </h2>

              <p className="text-[11px] text-slate-500 leading-normal">
                Задайте интервал ночного отключения экрана (по умолчанию 22:00 – 06:00).
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-600 uppercase">Сон с (ЧЧ:ММ)</span>
                  <input
                    type="text"
                    value={sleepStart}
                    onChange={(e) => onChangeSleepHours(e.target.value, sleepEnd)}
                    placeholder="22:00"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono focus:outline-none text-slate-100"
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-600 uppercase">Подъем в (ЧЧ:ММ)</span>
                  <input
                    type="text"
                    value={sleepEnd}
                    onChange={(e) => onChangeSleepHours(sleepStart, e.target.value)}
                    placeholder="06:00"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-xs text-center font-mono focus:outline-none text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* MANAGING REGISTERED STATIONS WITH DELETION: Exactly matching reference design */}
            <div className="space-y-3 bg-slate-950/30 p-2.5 rounded-2xl border border-slate-800/60 flex flex-col">
              <h2 className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Управление станциями ({stations.length})
              </h2>

              <div className="divide-y divide-slate-850 max-h-[220px] overflow-y-auto space-y-1.5 p-1 bg-slate-950/80 rounded-xl pr-2 border border-slate-850/40">
                {stations.length === 0 ? (
                  <p className="text-xs font-mono text-slate-600 text-center py-4">Список пуст</p>
                ) : (
                  stations.map((s) => (
                    <div key={s.id} className="flex justify-between items-center py-1.5 first:pt-0 last:pb-0 px-1 border-b border-slate-900/60">
                      <div className="truncate pr-2">
                        <span className="text-[11px] font-bold text-slate-300 block truncate leading-3">
                          {s.name}
                        </span>
                        <span className="text-[9px] text-slate-650 font-mono">
                          {s.lat.toFixed(3)}, {s.lon.toFixed(3)}
                        </span>
                      </div>
                      <button
                        onClick={() => setStationToDelete(s)}
                        className="cursor-pointer bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] px-2.5 py-1 rounded transition-all shadow uppercase flex items-center space-x-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Удалить</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-slate-950 p-3 border-t border-slate-800/80 text-center font-mono text-[10px] text-slate-600 select-none">
        Комбинация: <span className="text-slate-500">Ctrl + Alt + A</span>
      </div>

      {/* Confirmation Dialog Overlay */}
      {stationToDelete && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col justify-center p-6 z-[1000] animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-4 max-w-[320px] mx-auto w-full">
            <div className="w-11 h-11 bg-red-950/80 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-900/80 animate-pulse">
              <Trash2 className="w-5 h-5" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-tight">Подтверждение удаления</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Вы уверены, что хотите удалить объект <span className="text-red-400 font-semibold font-sans">«{stationToDelete.name}»</span>? Данное действие необратимо.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-400 space-y-1 text-left">
              <div><span className="text-slate-500 font-bold">ТИП:</span> {stationToDelete.type.toUpperCase()}</div>
              {stationToDelete.city && <div><span className="text-slate-500 font-bold">ГОРОД:</span> {stationToDelete.city}</div>}
              <div><span className="text-slate-500 font-bold">КООРДИНАТЫ:</span> {stationToDelete.lat.toFixed(4)}, {stationToDelete.lon.toFixed(4)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1.5">
              <button
                type="button"
                onClick={() => setStationToDelete(null)}
                className="cursor-pointer bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-[11px] py-2.5 rounded-xl transition-all font-bold"
              >
                ОТМЕНА
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStation(stationToDelete.id);
                  setStationToDelete(null);
                }}
                className="cursor-pointer bg-red-750 hover:bg-red-700 text-white font-mono text-[11px] py-2.5 rounded-xl transition-all font-bold hover:scale-102 active:scale-98 shadow-lg shadow-red-950/50"
              >
                УДАЛИТЬ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
