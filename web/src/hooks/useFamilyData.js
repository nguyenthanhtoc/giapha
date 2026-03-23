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
        highlightDesc: m.highlight_desc
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

  const handleUpdate = useCallback(async (id, name, born) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ name, born })
        .eq('id', id);

      if (error) throw error;
      await loadData();
      return { success: true };
    } catch (e) {
      console.error('Update error:', e);
      return { success: false, error: e };
    }
  }, [loadData]);

  const handleDelete = useCallback(async (id) => {
    try {
      // Handle orphans and spouses first
      // In JS SDK we might need to do these sequentially or use a RPC
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
    }
  }, [loadData]);

  const handleAddMember = useCallback(async (data) => {
    try {
      const newId = `new_${Date.now()}`;
      const { error } = await supabase
        .from('members')
        .insert([{
          id: newId,
          name: data.name,
          gender: data.gender,
          parent_id: data.parentId || null,
          spouse_id: data.spouseId || null,
          role: data.role || null
        }]);

      if (error) throw error;
      await loadData();
      return { success: true };
    } catch (e) {
      console.error('Add member error:', e);
      return { success: false, error: e };
    }
  }, [loadData]);

  return {
    mergedData,
    loadData,
    handleUpdate,
    handleDelete,
    handleAddMember
  };
};
