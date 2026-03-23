import { useState, useCallback, useEffect } from 'react';


export const useFamilyData = (initialData = []) => {
  const [mergedData, setMergedData] = useState(initialData);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      setMergedData(data);
    } catch (e) {
      console.error('Error loading members:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdate = useCallback(async (id, name, born) => {
    const body = { [id]: { name, born } };
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        await loadData();
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: e };
    }
    return { success: false };
  }, [loadData]);

  const handleDelete = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/members?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: e };
    }
    return { success: false };
  }, [loadData]);

  const handleAddMember = useCallback(async (data) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data })
      });
      if (res.ok) {
        await loadData();
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: e };
    }
    return { success: false };
  }, [loadData]);

  return {
    mergedData,
    loadData,
    handleUpdate,
    handleDelete,
    handleAddMember
  };
};
