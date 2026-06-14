/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Station } from '../types';

/**
 * Exports an array of stations to a downloadable Excel file (stations.xlsx).
 */
export function exportToExcel(stations: Station[]): void {
  const data = stations.map(s => ({
    'ID': s.id,
    'Название': s.name,
    'Широта': s.lat,
    'Долгота': s.lon,
    'Тип (rosatom / tpu / joint)': s.type,
    'Город/Регион': s.city || '',
    'Краткое описание': s.shortInfo,
    'Полное описание': s.fullInfo,
    'Дата создания': new Date(s.createdAt).toLocaleString('ru-RU')
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Объекты Карта');

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 15 }, // ID
    { wch: 40 }, // Название
    { wch: 12 }, // Широта
    { wch: 12 }, // Долгота
    { wch: 15 }, // Тип
    { wch: 20 }, // Город
    { wch: 50 }, // Краткое описание
    { wch: 80 }, // Полное описание
    { wch: 20 }  // Дата
  ];

  // Write and download
  XLSX.writeFile(workbook, 'rosatom_tpu_stations.xlsx');
}

/**
 * Parses an Excel file uploaded by the user and returns a list of stations.
 */
export function importFromExcel(file: File): Promise<Partial<Station>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Не удалось прочесть файл.');

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet);
        
        // Map any flexible headings (Russian/English)
        const parsed: Partial<Station>[] = rawRows.map((row, idx) => {
          const id = row['ID'] || row['id'] || `imported-${Date.now()}-${idx}`;
          const name = row['Название'] || row['name'] || row['Наименование'] || '';
          
          let lat = parseFloat(row['Широта'] || row['lat'] || row['latitude'] || '0');
          let lon = parseFloat(row['Долгота'] || row['lon'] || row['longitude'] || '0');
          
          let typeStr = String(row['Тип (rosatom / tpu / joint)'] || row['тип'] || row['type'] || 'joint').toLowerCase().trim();
          let type: 'rosatom' | 'tpu' | 'joint' = 'joint';
          if (typeStr.includes('rosatom') || typeStr.includes('росатом')) {
            type = 'rosatom';
          } else if (typeStr.includes('tpu') || typeStr.includes('тпу')) {
            type = 'tpu';
          }

          const city = row['Город/Регион'] || row['город'] || row['city'] || '';
          const shortInfo = row['Краткое описание'] || row['shortInfo'] || row['brief'] || '';
          const fullInfo = row['Полное описание'] || row['fullInfo'] || row['details'] || '';
          const createdAt = row['Дата создания'] ? new Date(row['Дата создания']).getTime() : Date.now();

          return {
            id,
            name,
            lat,
            lon,
            type,
            city,
            shortInfo,
            fullInfo,
            createdAt: isNaN(createdAt) ? Date.now() : createdAt
          };
        }).filter(s => s.name && s.lat && s.lon); // keep only valid rows

        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}
