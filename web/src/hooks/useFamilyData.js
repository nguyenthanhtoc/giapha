import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import familyData from '@/data/family.json';

export const useFamilyData = (initialData = []) => {
  const [mergedData, setMergedData] = useState(initialData);

  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true });
      
      if (error) throw error;

      // Map snake_case from DB to camelCase if necessary (matching previous aliasing)
      const mapped = data.map(m => ({
        ...m,
        parentId: m.parent_id,
        spouseId: m.spouse_id,
        highlightDesc: m.highlight_desc,
        sort_order: m.sort_order ?? null,
        // Resilient mapping for alias, address and is_alive
        alias: m.alias || m.bi_danh || '',
        dacVi: m.dac_vi || '',
        address: m.address || m.dia_chi || '',
        // Default to true if is_alive is null AND death is null/empty
        isAlive: m.is_alive !== null && m.is_alive !== undefined
          ? m.is_alive
          : (m.death || m.nam_mat ? false : true)
      }));

      setMergedData(mapped);
    } catch (e) {
      console.error('Error loading members from Supabase:', e);
      setMergedData(familyData);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const [updatingIds, setUpdatingIds] = useState(new Set());

  const handleUpdate = useCallback(async (id, name, born, death, address, alias, isAlive, dacVi, gender) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(id));

      const updateData = {
        name,
        born: born || null,
        death: death || null,
        is_alive: isAlive,
        bi_danh: alias || null,
        dac_vi: dacVi || null,
        dia_chi: address || null,
        ...(gender ? { gender } : {}),
      };

      const { error } = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      await loadData();
      return { success: true };
    } catch (e) {
      console.error('Update error:', e);
      return { success: false, error: e };
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [loadData]);

  const handleDelete = useCallback(async (id) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(id));
      // Handle orphans and spouses first
      await supabase.from('members').update({ parent_id: null }).eq('parent_id', id);
      await supabase.from('members').update({ spouse_id: null }).eq('spouse_id', id);
      
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
      return { success: true };
    } catch (e) {
      console.error('Delete error:', e);
      return { success: false, error: e };
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [loadData]);

  const handleAddMember = useCallback(async (data) => {
    let newId = `new_${Date.now()}`;
    try {
      setUpdatingIds(prev => new Set(prev).add(newId));
      
      const insertData = {
        id: newId,
        name: data.name,
        gender: data.gender,
        parent_id: data.parentId || null,
        spouse_id: data.spouseId || null,
        role: data.role || null,
        born: data.born || null,
        death: data.death || null,
        is_alive: data.isAlive !== undefined ? data.isAlive : true,
        bi_danh: data.alias || null,
        dac_vi: data.dacVi || null,
        dia_chi: data.address || null
      };

      const { data: inserted, error } = await supabase
        .from('members')
        .insert([insertData])
        .select();

      if (error) throw error;
      await loadData();
      return { success: true, data: inserted?.[0] };
    } catch (e) {
      console.error('Add member error:', e);
      return { success: false, error: e };
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(newId);
        return next;
      });
    }
  }, [loadData]);

  const handleMoveNode = useCallback(async (id, direction) => {
    // Find all siblings (same parent_id, not spouses)
    const node = mergedData.find(m => m.id === id);
    if (!node) return { success: false };

    const siblings = mergedData
      .filter(m => m.parentId === node.parentId && !m.spouseId)
      .sort((a, b) => {
        // Sort by current sort_order (from DB), fallback to id order
        const ao = a.sort_order ?? Infinity;
        const bo = b.sort_order ?? Infinity;
        if (ao !== bo) return ao - bo;
        return a.id < b.id ? -1 : 1;
      });

    const idx = siblings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };

    const swapIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) return { success: false };

    const nodeA = siblings[idx];
    const nodeB = siblings[swapIdx];

    // Assign stable order values: use index * 10 for spacing, then swap the two
    // First normalize all siblings if they don't have sort_order yet
    const needsNormalize = siblings.some(s => s.sort_order == null);

    try {
      setUpdatingIds(prev => new Set(prev).add(id));

      if (needsNormalize) {
        // Set sort_order for all siblings based on current position
        const updates = siblings.map((s, i) => ({
          id: s.id,
          sort_order: (i + 1) * 10
        }));
        for (const u of updates) {
          const { error } = await supabase.from('members').update({ sort_order: u.sort_order }).eq('id', u.id);
          if (error) throw error;
        }
        // Now swap A and B
        const newOrderA = (swapIdx + 1) * 10;
        const newOrderB = (idx + 1) * 10;
        const { error: errA } = await supabase.from('members').update({ sort_order: newOrderA }).eq('id', nodeA.id);
        if (errA) throw errA;
        const { error: errB } = await supabase.from('members').update({ sort_order: newOrderB }).eq('id', nodeB.id);
        if (errB) throw errB;
      } else {
        // Just swap sort_order values between A and B
        const orderA = nodeA.sort_order;
        const orderB = nodeB.sort_order;
        const { error: errA } = await supabase.from('members').update({ sort_order: orderB }).eq('id', nodeA.id);
        if (errA) throw errA;
        const { error: errB } = await supabase.from('members').update({ sort_order: orderA }).eq('id', nodeB.id);
        if (errB) throw errB;
      }

      await loadData();
      return { success: true };
    } catch (e) {
      console.error('Move node error:', e);
      return { success: false, error: e };
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [mergedData, loadData]);

  return {
    mergedData,
    loadData,
    handleUpdate,
    handleDelete,
    handleAddMember,
    handleMoveNode,
    updatingIds
  };
};
