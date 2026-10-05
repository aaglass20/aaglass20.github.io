// ============================================================
//  EP_DB — Empower Playbook data layer
//
//  Every method is async. If Supabase is unavailable the call
//  transparently falls back to localStorage so the app keeps
//  working offline.
//
//  Usage:
//    const locs = await EP_DB.locations.list();
//    const saved = await EP_DB.locations.save(locObj);
//    await EP_DB.locations.delete(id);
//
//  Depends on:
//    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
//    <script src="js/config.js"></script>   (sets window.EP_CONFIG)
// ============================================================

const EP_DB = (function () {

  // ── Supabase client (lazy init) ──────────────────────────
  let _sb = null;

  function getSb() {
    if (_sb) return _sb;
    if (!window.supabase || !window.EP_CONFIG) return null;
    _sb = window.supabase.createClient(
      window.EP_CONFIG.SUPABASE_URL,
      window.EP_CONFIG.SUPABASE_ANON_KEY
    );
    return _sb;
  }

  // ── Generic localStorage helpers ─────────────────────────
  function lsLoad(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }
  function lsSave(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.error('[EP_DB] localStorage write failed:', e); }
  }
  function lsGenId(prefix) {
    return (prefix || 'id') + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ============================================================
  //  LOCATIONS
  //  localStorage key: 'empowerLocations'  →  ep_locations
  // ============================================================

  function rowToLocation(r) {
    return {
      id:        r.id,
      name:      r.name,
      address:   r.address   || '',
      lat:       r.lat       || null,
      lon:       r.lon       || null,
      notes:     r.notes     || '',
      image:     r.image_data || null,
      createdAt: r.created_at,
    };
  }
  function locationToRow(l, isNew) {
    const row = {
      name:       l.name,
      address:    l.address   || null,
      lat:        l.lat       || null,
      lon:        l.lon       || null,
      notes:      l.notes     || null,
      image_data: l.image     || null,
    };
    if (!isNew && l.id) row.id = l.id;
    return row;
  }

  // localStorage fallback helpers for locations
  function lsListLocations()  { return lsLoad('empowerLocations', []); }
  function lsSaveLocation(loc) {
    const arr = lsListLocations();
    if (loc.id) {
      const i = arr.findIndex(l => l.id === loc.id);
      if (i >= 0) arr[i] = loc; else arr.unshift(loc);
    } else {
      loc.id = lsGenId('loc');
      arr.unshift(loc);
    }
    lsSave('empowerLocations', arr);
    return loc;
  }
  function lsDeleteLocation(id) {
    lsSave('empowerLocations', lsListLocations().filter(l => l.id !== id));
  }

  const locations = {
    async list() {
      const sb = getSb();
      if (!sb) return lsListLocations();
      const { data, error } = await sb
        .from('ep_locations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.warn('[EP_DB] locations.list:', error); return lsListLocations(); }
      return data.map(rowToLocation);
    },

    async save(loc) {
      const sb = getSb();
      if (!sb) return lsSaveLocation({ ...loc });

      if (loc.id) {
        const { data, error } = await sb
          .from('ep_locations')
          .update(locationToRow(loc, false))
          .eq('id', loc.id)
          .select()
          .single();
        if (error) { console.warn('[EP_DB] locations.update:', error); return lsSaveLocation({ ...loc }); }
        return rowToLocation(data);
      } else {
        const { data, error } = await sb
          .from('ep_locations')
          .insert(locationToRow(loc, true))
          .select()
          .single();
        if (error) { console.warn('[EP_DB] locations.insert:', error); return lsSaveLocation({ ...loc }); }
        return rowToLocation(data);
      }
    },

    async delete(id) {
      const sb = getSb();
      if (!sb) { lsDeleteLocation(id); return; }
      const { error } = await sb.from('ep_locations').delete().eq('id', id);
      if (error) { console.warn('[EP_DB] locations.delete:', error); lsDeleteLocation(id); }
    },
  };

  // ============================================================
  //  PROGRAMS
  //  localStorage key: 'empowerPrograms'  →  ep_programs
  //                                          ep_program_weeks
  //  The assembled JS shape includes weeks[] and plans{} map.
  //  plans{} is built by querying ep_plans for plan IDs.
  // ============================================================

  function rowToProgram(progRow, weekRows) {
    return {
      id:         progRow.id,
      name:       progRow.name,
      sport:      progRow.sport,
      sportIcon:  progRow.sport_icon  || '',
      sportName:  progRow.sport_name  || progRow.sport,
      locationId: progRow.location_id || null,
      numWeeks:   progRow.num_weeks,
      groups:     progRow.groups      || [],
      weeks:      (weekRows || [])
                    .sort((a, b) => a.week_num - b.week_num)
                    .map(w => ({ weekNum: w.week_num, date: w.session_date || null })),
      plans:      progRow.slot_plans  || {},
      createdAt:  progRow.created_at,
    };
  }

  // localStorage fallbacks for programs
  function lsListPrograms()  { return lsLoad('empowerPrograms', []); }
  function lsSaveProgram(prog) {
    const arr = lsListPrograms();
    if (prog.id) {
      const i = arr.findIndex(p => p.id === prog.id);
      if (i >= 0) arr[i] = prog; else arr.unshift(prog);
    } else {
      prog.id = lsGenId('prog');
      arr.unshift(prog);
    }
    lsSave('empowerPrograms', arr);
    return prog;
  }
  function lsDeletePrograms(ids) {
    lsSave('empowerPrograms', lsListPrograms().filter(p => !ids.includes(p.id)));
  }

  const programs = {
    async list() {
      const sb = getSb();
      if (!sb) return lsListPrograms();
      const { data: progRows, error } = await sb
        .from('ep_programs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) { console.warn('[EP_DB] programs.list:', error); return lsListPrograms(); }

      // Fetch weeks for all programs; slot→plan map comes from slot_plans JSONB column
      const progIds = progRows.map(p => p.id);
      const { data: weekData } = await sb
        .from('ep_program_weeks').select('*').in('program_id', progIds);

      const weeksByProg = groupBy(weekData || [], 'program_id');
      return progRows.map(r => rowToProgram(r, weeksByProg[r.id]));
    },

    async save(prog) {
      const sb = getSb();
      if (!sb) return lsSaveProgram({ ...prog });

      const progRow = {
        name:        prog.name,
        sport:       prog.sport,
        sport_icon:  prog.sportIcon  || null,
        sport_name:  prog.sportName  || null,
        location_id: prog.locationId || null,
        num_weeks:   prog.numWeeks,
        groups:      prog.groups,
        slot_plans:  prog.plans      || {},
      };

      let savedId = prog.id;
      if (prog.id) {
        const { error } = await sb.from('ep_programs').update(progRow).eq('id', prog.id);
        if (error) { console.warn('[EP_DB] programs.update:', error); return lsSaveProgram({ ...prog }); }
      } else {
        const { data, error } = await sb.from('ep_programs').insert(progRow).select().single();
        if (error) { console.warn('[EP_DB] programs.insert:', error); return lsSaveProgram({ ...prog }); }
        savedId = data.id;
      }

      // Sync weeks: delete old rows, re-insert
      await sb.from('ep_program_weeks').delete().eq('program_id', savedId);
      if (prog.weeks && prog.weeks.length) {
        const weekRows = prog.weeks.map(w => ({
          program_id:   savedId,
          week_num:     w.weekNum,
          session_date: w.date || null,
        }));
        const { error: wErr } = await sb.from('ep_program_weeks').insert(weekRows);
        if (wErr) console.warn('[EP_DB] program_weeks.insert:', wErr);
      }

      return { ...prog, id: savedId };
    },

    async delete(ids) {
      const idArr = Array.isArray(ids) ? ids : [ids];
      const sb = getSb();
      if (!sb) { lsDeletePrograms(idArr); return; }
      // Cascades to ep_program_weeks and ep_plans via FK ON DELETE CASCADE
      const { error } = await sb.from('ep_programs').delete().in('id', idArr);
      if (error) { console.warn('[EP_DB] programs.delete:', error); lsDeletePrograms(idArr); }
    },
  };

  // ============================================================
  //  PLANS
  //  localStorage key: 'empowerPlans'  →  ep_plans
  // ============================================================

  function rowToPlan(r) {
    return {
      id:              r.id,
      name:            r.name        || '',
      programId:       r.program_id  || null,
      weekNum:         r.week_num    || null,
      group:           r.group_name  || null,
      sport:           r.sport,
      sportIcon:       r.sport_icon  || '',
      sportName:       r.sport_name  || r.sport,
      durationMinutes: r.duration_minutes,
      hasWarmup:       r.has_warmup,
      blocks:          r.blocks      || [],
      createdAt:       r.created_at,
      updatedAt:       r.updated_at,
    };
  }

  function lsGetPlan(id)        { return (lsLoad('empowerPlans', {}))[id] || null; }
  function lsListPlans()        { return Object.values(lsLoad('empowerPlans', {})).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')); }
  function lsDeletePlan(id)     { const all = lsLoad('empowerPlans', {}); delete all[id]; lsSave('empowerPlans', all); }
  function lsSavePlanToLs(plan) {
    const all = lsLoad('empowerPlans', {});
    all[plan.id] = plan;
    lsSave('empowerPlans', all);
    // Also update the program's plans map in empowerPrograms
    if (plan.programId) {
      const progs = lsListPrograms();
      const p = progs.find(x => x.id === plan.programId);
      if (p) {
        if (!p.plans) p.plans = {};
        p.plans[`w${plan.weekNum}-${plan.group}`] = plan.id;
        lsSave('empowerPrograms', progs);
      }
    }
    return plan;
  }

  const plans = {
    async list() {
      const sb = getSb();
      if (!sb) return lsListPlans();
      const { data, error } = await sb
        .from('ep_plans')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) { console.warn('[EP_DB] plans.list:', error); return lsListPlans(); }
      return data.map(rowToPlan);
    },

    async get(planId) {
      const sb = getSb();
      if (!sb) return lsGetPlan(planId);
      const { data, error } = await sb
        .from('ep_plans')
        .select('*')
        .eq('id', planId)
        .single();
      if (error) { console.warn('[EP_DB] plans.get:', error); return lsGetPlan(planId); }
      return rowToPlan(data);
    },

    async save(plan) {
      const sb = getSb();
      if (!sb) return lsSavePlanToLs({ ...plan });

      const row = {
        name:             plan.name            || null,
        program_id:       plan.programId       || null,
        week_num:         plan.weekNum         || null,
        group_name:       plan.group           || null,
        sport:            plan.sport,
        sport_icon:       plan.sportIcon       || null,
        sport_name:       plan.sportName       || null,
        duration_minutes: plan.durationMinutes || 75,
        has_warmup:       plan.hasWarmup       ?? true,
        blocks:           plan.blocks          || [],
      };

      if (plan.id) {
        const { data, error } = await sb
          .from('ep_plans')
          .update(row)
          .eq('id', plan.id)
          .select()
          .single();
        if (error) { console.warn('[EP_DB] plans.update:', error); return lsSavePlanToLs({ ...plan }); }
        // Update program weeks map after saving
        await _syncPlanToProgram(sb, { ...rowToPlan(data) });
        return rowToPlan(data);
      } else {
        const { data, error } = await sb
          .from('ep_plans')
          .insert(row)
          .select()
          .single();
        if (error) { console.warn('[EP_DB] plans.insert:', error); return lsSavePlanToLs({ ...plan }); }
        await _syncPlanToProgram(sb, rowToPlan(data));
        return rowToPlan(data);
      }
    },

    async delete(id) {
      const sb = getSb();
      if (!sb) { lsDeletePlan(id); return; }
      const { error } = await sb.from('ep_plans').delete().eq('id', id);
      if (error) { console.warn('[EP_DB] plans.delete:', error); lsDeletePlan(id); }
    },
  };

  // After a plan is saved, the program's in-memory plans{} map needs the new
  // plan ID — callers refresh their program object from programs.list().
  // This helper is a no-op on the DB side (the ID is already in ep_plans).
  async function _syncPlanToProgram(sb, plan) {
    // No extra write needed; the program dashboard derives the plans map
    // by querying ep_plans per program. No-op here.
  }

  // ============================================================
  //  DRILLS (custom only)
  //  localStorage key: 'empowerDrillBank'  →  ep_drills
  // ============================================================

  // DB row (snake_case) ↔ JS object (camelCase) for drills
  function rowToDrill(r) {
    return {
      id:             r.id,
      sport:          r.sport,
      category:       r.category        || '',
      icon:           r.icon            || '⚽',
      name:           r.name,
      description:    r.description     || '',
      steps:          r.steps           || [],
      equipment:      r.equipment       || [],
      why:            r.purpose         || '',   // DB col is 'purpose'
      volunteerTip:   r.volunteer_tip   || '',
      facilitatorTip: r.facilitator_tip || '',
      defaultTime:    r.default_time    || 12,
      source:         r.source          || 'user',
    };
  }
  function drillToRow(d) {
    const row = {
      sport:          d.sport,
      category:       d.category        || null,
      icon:           d.icon            || null,
      name:           d.name,
      description:    d.description     || null,
      steps:          d.steps           || [],
      equipment:      d.equipment       || [],
      purpose:        d.why             || null,  // JS 'why' → DB 'purpose'
      volunteer_tip:  d.volunteerTip    || null,
      facilitator_tip: d.facilitatorTip || null,
      default_time:   d.defaultTime     || 12,
      source:         d.source          || 'user',
    };
    if (d.id) row.id = d.id;
    return row;
  }

  function lsListDrills() { return lsLoad('empowerDrillBank', []); }
  function lsSaveDrill(drill) {
    const arr = lsListDrills();
    if (drill.id) {
      const i = arr.findIndex(d => d.id === drill.id);
      if (i >= 0) arr[i] = drill; else arr.push(drill);
    } else {
      drill.id = lsGenId('drill');
      arr.push(drill);
    }
    lsSave('empowerDrillBank', arr);
    return drill;
  }

  const drills = {
    async list(sport) {
      const sb = getSb();
      if (!sb) {
        const all = lsListDrills();
        return sport ? all.filter(d => d.sport === sport) : all;
      }
      let q = sb.from('ep_drills').select('*').order('created_at', { ascending: true });
      if (sport) q = q.eq('sport', sport);
      const { data, error } = await q;
      if (error) { console.warn('[EP_DB] drills.list:', error); return lsListDrills(); }
      return data.map(rowToDrill);
    },

    async save(drill) {
      const sb = getSb();
      if (!sb) return lsSaveDrill({ ...drill });
      const row = drillToRow(drill);
      const { data, error } = await sb
        .from('ep_drills')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();
      if (error) { console.warn('[EP_DB] drills.save:', error); return lsSaveDrill({ ...drill }); }
      return rowToDrill(data);
    },

    async delete(id) {
      const sb = getSb();
      if (!sb) {
        lsSave('empowerDrillBank', lsListDrills().filter(d => d.id !== id));
        return;
      }
      const { error } = await sb.from('ep_drills').delete().eq('id', id);
      if (error) { console.warn('[EP_DB] drills.delete:', error); lsSave('empowerDrillBank', lsListDrills().filter(d => d.id !== id)); }
    },
  };

  // ============================================================
  //  MIGRATION UTILITY
  //  Call EP_DB.migrateFromLocalStorage() from the browser
  //  console once to push existing localStorage data to Supabase.
  // ============================================================
  async function migrateFromLocalStorage() {
    const sb = getSb();
    if (!sb) { console.error('[EP_DB] Supabase not available — migration skipped'); return; }

    console.log('[EP_DB] Starting localStorage → Supabase migration…');
    const results = { locations: 0, programs: 0, plans: 0, drills: 0, errors: [] };

    // Locations
    for (const loc of lsListLocations()) {
      const row = { ...locationToRow(loc, false), id: loc.id };
      const { error } = await sb.from('ep_locations').upsert(row, { onConflict: 'id' });
      if (error) results.errors.push({ entity: 'location', id: loc.id, error });
      else results.locations++;
    }

    // Programs + weeks
    const progs = lsListPrograms();
    for (const prog of progs) {
      const progRow = {
        id:          prog.id,
        name:        prog.name,
        sport:       prog.sport,
        sport_icon:  prog.sportIcon  || null,
        sport_name:  prog.sportName  || null,
        location_id: prog.locationId || null,
        num_weeks:   prog.numWeeks,
        groups:      prog.groups,
      };
      const { error: pErr } = await sb.from('ep_programs').upsert(progRow, { onConflict: 'id' });
      if (pErr) { results.errors.push({ entity: 'program', id: prog.id, error: pErr }); continue; }
      results.programs++;
      if (prog.weeks && prog.weeks.length) {
        for (const w of prog.weeks) {
          const { error: wErr } = await sb.from('ep_program_weeks').upsert({
            program_id:   prog.id,
            week_num:     w.weekNum,
            session_date: w.date || null,
          }, { onConflict: 'program_id, week_num' });
          if (wErr) results.errors.push({ entity: 'week', programId: prog.id, weekNum: w.weekNum, error: wErr });
        }
      }
    }

    // Plans
    const allPlans = lsLoad('empowerPlans', {});
    for (const plan of Object.values(allPlans)) {
      const row = {
        id:               plan.id,
        program_id:       plan.programId       || null,
        week_num:         plan.weekNum         || null,
        group_name:       plan.group           || null,
        sport:            plan.sport,
        sport_icon:       plan.sportIcon       || null,
        sport_name:       plan.sportName       || null,
        duration_minutes: plan.durationMinutes || 75,
        has_warmup:       plan.hasWarmup       ?? true,
        blocks:           plan.blocks          || [],
      };
      const { error } = await sb.from('ep_plans').upsert(row, { onConflict: 'id' });
      if (error) results.errors.push({ entity: 'plan', id: plan.id, error });
      else results.plans++;
    }

    // Custom drills
    for (const drill of lsListDrills()) {
      const { error } = await sb.from('ep_drills').upsert(drill, { onConflict: 'id' });
      if (error) results.errors.push({ entity: 'drill', id: drill.id, error });
      else results.drills++;
    }

    console.log('[EP_DB] Migration complete:', results);
    if (results.errors.length) console.warn('[EP_DB] Errors:', results.errors);
    return results;
  }

  // ── Utility ──────────────────────────────────────────────
  function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const k = item[key];
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {});
  }

  // ── Public API ────────────────────────────────────────────
  return { locations, programs, plans, drills, migrateFromLocalStorage };

})();
