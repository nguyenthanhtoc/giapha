'use client';

import React, { useEffect, useRef } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { parseYear } from '@/utils/stringUtils';

/**
 * SearchPanel — floating search UI for the family tree.
 *
 * Props:
 *  members   — full array of family members
 *  onSelect  — callback(person) when a result is picked
 *  isMinimal — hide when minimal mode is active
 */
export default function SearchPanel({ members, onSelect, isMinimal }) {
  const { query, setQuery, results, totalCount } = useSearch(members);
  const DISPLAY_LIMIT = 5;
  const visibleResults = results.slice(0, DISPLAY_LIMIT);
  const hiddenCount = totalCount - visibleResults.length;
  const inputRef = useRef(null);

  const isOpen = query.trim().length > 0;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // setQuery is a stable setter ref — no dep needed

  const handleSelect = (person) => {
    setQuery('');
    onSelect(person);
  };

  if (isMinimal) return null;

  return (
    // search-panel-pos: fixed, centered, responsive position (bottom on mobile / top on desktop)
    // position:fixed also acts as containing block for absolute children
    <div
      className="fixed z-40 search-panel-pos"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search input bar — always rendered first in DOM */}
      {/* When open: mobile = rounded-b (dropdown above), desktop = rounded-t (dropdown below) */}
      <div className={`flex items-center gap-2 bg-[#fffbeb]/95 backdrop-blur-sm border-2 shadow-xl transition-all duration-200 ${
        isOpen
          ? 'border-amber-700 rounded-b-xl rounded-t-none sm:rounded-t-xl sm:rounded-b-none'
          : 'border-amber-900/30 rounded-xl hover:border-amber-900/60'
      }`}>
        {/* Search icon */}
        <div className="pl-3 text-amber-700/60 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm tên..."
          className="flex-1 min-w-0 py-2 pr-1 bg-transparent text-sm font-medium text-amber-900 placeholder:text-amber-900/40 outline-none font-spectral"
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="pr-3 text-amber-700/50 hover:text-amber-900 transition-colors flex-shrink-0"
            aria-label="Xóa tìm kiếm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown — absolutely positioned:
          mobile: bottom:100% (above input bar)
          desktop: top:100% (below input bar) via .search-dropdown CSS class */}
      {isOpen && (
        <div className="search-dropdown bg-[#fffbeb]/95 backdrop-blur-sm border-2 border-amber-700 shadow-2xl overflow-hidden">
          {totalCount === 0 ? (
            <div className="px-4 py-3 text-sm text-amber-900/50 italic font-spectral text-center">
              Không tìm thấy kết quả
            </div>
          ) : (
            <ul className="divide-y divide-amber-900/10">
              {visibleResults.map(({ person, parentName, isSpouse, generation }) => {
                const bornYear = parseYear(person.born);
                const deathYear = parseYear(person.death);
                const lifespan = bornYear || deathYear
                  ? `${bornYear || '?'} – ${person.isAlive ? 'nay' : (deathYear || '?')}`
                  : null;

                return (
                  <li key={person.id}>
                    <button
                      onClick={() => handleSelect(person)}
                      className="w-full text-left px-4 py-2.5 hover:bg-amber-900/10 active:bg-amber-900/15 transition-colors duration-100 flex flex-col gap-0.5"
                    >
                      {/* Name row */}
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm font-black text-amber-900 font-spectral truncate flex-1 min-w-0">
                          {person.name}
                        </span>
                        {isSpouse && (
                          <span className="text-[10px] font-bold text-pink-700/80 uppercase tracking-wide flex-shrink-0">
                            vợ/chồng
                          </span>
                        )}
                      </div>

                      {/* Meta row: generation + lifespan */}
                      {(generation || lifespan) && (
                        <div className="flex items-center gap-2 min-w-0">
                          {generation && (
                            <span className="text-[10px] font-bold text-amber-700/70 uppercase tracking-wider truncate">
                              {generation}
                            </span>
                          )}
                          {lifespan && (
                            <>
                              {generation && <span className="text-amber-900/20 text-[10px]">·</span>}
                              <span className="text-[10px] text-amber-900/50 font-medium flex-shrink-0">
                                {lifespan}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Parent / spouse-of row */}
                      {parentName && (
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-[10px] text-amber-900/40 flex-shrink-0">
                            {isSpouse ? 'Phối ngẫu:' : 'Con của:'}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-900/60 truncate">
                            {parentName}
                          </span>
                        </div>
                      )}

                      {/* Alias */}
                      {person.alias && (
                        <div className="text-[10px] text-amber-900/40 italic truncate">
                          Bí danh: {person.alias}
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer: total count + hint if more results hidden */}
          {totalCount > 0 && (
            <div className="px-4 py-2 border-t border-amber-900/10 bg-amber-900/5 flex items-center justify-between gap-2">
              <span className="text-[10px] text-amber-900/40 font-medium">
                {totalCount} kết quả
              </span>
              {hiddenCount > 0 && (
                <span className="text-[10px] font-bold text-amber-700/60 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
                    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM1.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM14.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
                  </svg>
                  còn {hiddenCount} kết quả khác
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
