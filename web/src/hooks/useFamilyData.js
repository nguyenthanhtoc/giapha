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
        .order('id', { ascending: true });
      
      if (error) throw error;

      // Map snake_case from DB to camelCase if necessary (matching previous aliasing)
      const mapped = data.map(m => ({
        ...m,
        parentId: m.parent_id,
        spouseId: m.spouse_id,
        highlightDesc: m.highlight_desc,
        // Resilient mapping for alias and address
        alias: m.alias || m.bi_danh || '',
        address: m.address || m.dia_chi || ''
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

  const handleUpdate = useCallback(async (id, name, born, death, address, alias) => {
    try {
      setUpdatingIds(prev => new Set(prev).add(id));
      
      // We try to update both naming conventions to be safe, 
      // though typically you should use the one that exists in your DB.
      // If the error persists, please ensure columns 'alias' (or 'bi_danh') 
      // and 'address' (or 'dia_chi') exist in Supabase.
      const updateData = { name, born, death };
      if (address) {
          updateData.address = address;
          updateData.dia_chi = address;
      }
      if (alias) {
          updateData.alias = alias;
          updateData.bi_danh = alias;
      }

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
        role: data.role || null
      };

      if (data.alias) {
        insertData.alias = data.alias;
        insertData.bi_danh = data.alias;
      }

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

  return {
    mergedData,
    loadData,
    handleUpdate,
    handleDelete,
    handleAddMember,
    updatingIds
  };
};
