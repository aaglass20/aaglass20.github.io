import { supabase } from '../supabaseClient';
import { useState, useCallback } from 'react';

const LS_KEY = 'soccer_scenarios';

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage(scenarios) {
  localStorage.setItem(LS_KEY, JSON.stringify(scenarios));
}

export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isOffline = !supabase;

  const saveScenario = useCallback(async (scenario) => {
    setLoading(true);
    setError(null);
    try {
      if (isOffline) {
        const existing = loadFromLocalStorage();
        const idx = existing.findIndex((s) => s.id === scenario.id);
        if (idx >= 0) {
          existing[idx] = scenario;
        } else {
          existing.push(scenario);
        }
        saveToLocalStorage(existing);
        return scenario;
      }

      const row = {
        id: scenario.id,
        title: scenario.title,
        description: scenario.description,
        category: scenario.category,
        game_format: scenario.gameFormat,
        formation: scenario.formation,
        data: {
          cones: scenario.cones,
          persistentLines: scenario.persistentLines,
          keyframes: scenario.keyframes,
        },
        updated_at: new Date().toISOString(),
      };

      const { data, error: err } = await supabase
        .from('scenarios')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message || 'Failed to save scenario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const loadScenarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOffline) {
        return loadFromLocalStorage();
      }

      const { data, error: err } = await supabase
        .from('scenarios')
        .select('*')
        .order('updated_at', { ascending: false });

      if (err) throw err;

      return (data || []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        gameFormat: row.game_format,
        formation: row.formation,
        cones: row.data?.cones || [],
        persistentLines: row.data?.persistentLines || [],
        keyframes: row.data?.keyframes || [],
      }));
    } catch (err) {
      setError(err.message || 'Failed to load scenarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const deleteScenario = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (isOffline) {
        const existing = loadFromLocalStorage();
        saveToLocalStorage(existing.filter((s) => s.id !== id));
        return;
      }

      const { error: err } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);

      if (err) throw err;
    } catch (err) {
      setError(err.message || 'Failed to delete scenario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  const updateScenario = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      if (isOffline) {
        const existing = loadFromLocalStorage();
        const idx = existing.findIndex((s) => s.id === id);
        if (idx >= 0) {
          existing[idx] = { ...existing[idx], ...updates };
          saveToLocalStorage(existing);
          return existing[idx];
        }
        return null;
      }

      const { data, error: err } = await supabase
        .from('scenarios')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update scenario');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isOffline]);

  return {
    saveScenario,
    loadScenarios,
    deleteScenario,
    updateScenario,
    loading,
    error,
    isOffline,
  };
}
