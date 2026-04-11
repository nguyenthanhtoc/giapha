import { useMemo, useState } from 'react';

/**
 * Normalize Vietnamese text: remove diacritics so typing "e" matches "ê", "ế", etc.
 */
export const normalizeVietnamese = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
};

// Generation labels matching treeDataHelpers.js (depth 1..9 → index 0..8)
const GENERATION_LABELS = [
  "Đệ Thập Nhất Thế Tổ",
  "Đệ Thập Nhị Thế Tổ",
  "Đệ Thập Tam Thế Tổ",
  "Đệ Thập Tứ Thế",
  "Đệ Thập Ngũ Thế",
  "Đệ Thập Lục Thế",
  "Đệ Thập Thất Thế",
  "Đệ Thập Bát Thế",
  "Đệ Thập Cửu Thế",
];

/**
 * Compute generation label by walking parentId chain.
 * Returns the label string or null if can't determine.
 */
const computeGeneration = (member, memberMap) => {
  // Spouses share the same generation as their main node
  const mainId = member.spouseId || member.id;
  let depth = 0;
  let node = memberMap[mainId];
  while (node && node.parentId && memberMap[node.parentId]) {
    depth++;
    node = memberMap[node.parentId];
    if (depth > 20) break; // safety guard against cycles
  }
  // depth here = number of hops from root main node
  // D3 depth = depth + 1 (virtual root adds 1), but generation index = D3 depth - 1 = depth
  return GENERATION_LABELS[depth] || `Thế Hệ ${depth + 11}`;
};

/**
 * useSearch — searches family members with diacritic-insensitive matching.
 * Returns results with name, generation info, and parent name.
 */
export const useSearch = (members) => {
  const [query, setQuery] = useState('');

  // Build a lookup map for quick parent/gen resolution
  const memberMap = useMemo(() => {
    const map = {};
    members.forEach(m => { map[m.id] = m; });
    return map;
  }, [members]);

  const { results, totalCount } = useMemo(() => {
    const q = query.trim();
    if (!q) return { results: [], totalCount: 0 };

    const normQ = normalizeVietnamese(q);

    const matches = members.filter(m => {
      const normName = normalizeVietnamese(m.name);
      const normAlias = normalizeVietnamese(m.alias);
      return normName.includes(normQ) || normAlias.includes(normQ);
    });

    const items = matches.map(m => {
      const isSpouse = !!m.spouseId;

      // Parent: for spouse → their main node; for main node → their parentId node
      let parent = null;
      if (isSpouse) {
        parent = memberMap[m.spouseId] || null;
      } else if (m.parentId) {
        parent = memberMap[m.parentId] || null;
      }

      // Generation: prefer mutation set by treeDataHelpers after first draw,
      // fall back to computing from parentId chain (works even before first draw)
      const generation = m.generation || computeGeneration(m, memberMap);

      return { person: m, parentName: parent?.name || null, isSpouse, generation };
    });

    return { results: items, totalCount: matches.length };
  }, [query, members, memberMap]);

  return { query, setQuery, results, totalCount };
};
