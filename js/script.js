'use strict';

// ── Clean Code: nombre del módulo expresa su propósito exacto ──
const EventBus = (() => {
  const _subscriptions = {};

  // Clean Code: nombre del parámetro descriptivo (eventName, no 'e' o 'ev')
  const subscribe = (eventName, callback) => {
    if (!_subscriptions[eventName]) _subscriptions[eventName] = [];
    _subscriptions[eventName].push(callback);
  };

  // Clean Code: función pequeña, hace una sola cosa
  const publish = (eventName, data) => {
    const listeners = _subscriptions[eventName] || [];
    listeners.forEach(callback => callback(data));
  };

  return { subscribe, publish };
})();


const StorageModule = (() => {
  // Clean Code: sin "magic strings", la clave está en una constante con nombre claro
  const STORAGE_KEY = 'aseo_grupo_v3';

  // Clean Code: cada función hace una sola operación, nombre = verbo + qué
  const save = state => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const load = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch {
      return null; // Clean Code: manejo de error explícito, no silencioso
    }
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { save, load, clear };
})();


const MembersModule = (() => {
  // Clean Code: datos centralizados en un solo lugar (fuente de verdad única)
  const _members = [
    'Alisson Paola Jaramillo Echeverry',
    'Carlos Andrés Zuluaga Atehortua',
    'Daniela Zapata López',
    'David Antonio Pescador Durán',
    'David Buendia Ruiz',
    'Eric Daniel Barreto Chavez',
    'Jhoan Steven Murillo García',
    'Jhon Alejandro Patiño Agudelo',
    'Juan Camilo Valencia Rey',
    'Juan Carlos Combita Sandoval',
    'Juan David Ferrer Castillo',
    'Juan José Santamaria Muñoz',
    'Julián David Flórez Vera',
    'Maria Fernanda Huertas Montes',
    'Nelson Fabián Gallego Sánchez',
    'Santiago Moreno Piedrahita',
    'Santiago Palacio Tovar',
    'Santiago Tovar Zambrano',
    'Sebastian Ortega Barrero',
    'Stiven Andrés Robles Galán',
    'Valeria Arcila Hernández',
    'Valeria Becerra Giraldo',
  ];

  // Clean Code: devuelve copia para proteger el array interno
  const getAll   = () => [..._members];
  const getCount = () => _members.length;

  return { getAll, getCount };
})();


const AssignmentModule = (() => {
  // Clean Code: configuración de días en estructura clara y legible
  const DAYS = [
    { key: 'lun', label: 'Lunes',      color: '#4A7FD4' },
    { key: 'mar', label: 'Martes',     color: '#4CAF6B' },
    { key: 'mie', label: 'Miércoles',  color: '#9B5FD4' },
    { key: 'jue', label: 'Jueves',     color: '#8E9BA8' },
    { key: 'vie', label: 'Viernes',    color: '#D4A840' },
  ];

  // Clean Code: sin números mágicos — 604800000 no dice nada, MS_PER_WEEK sí
  const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

  let _state = null;

  // Clean Code: función privada con nombre que explica exactamente qué hace
  const _formatDate = date =>
    date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

  const _buildWeekDates = baseMonday =>
    DAYS.map((_, index) => {
      const date = new Date(baseMonday);
      date.setDate(date.getDate() + index);
      return _formatDate(date);
    });

  const _getThisMonday = () => {
    const today        = new Date();
    const dayOfWeek    = today.getDay();
    // Clean Code: variable auxiliar con nombre descriptivo
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday       = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  };

  // Clean Code: función de una línea, nombre dice exactamente qué hace
  const _pickRandom = array =>
    array[Math.floor(Math.random() * array.length)];

  const _buildWeekState = (rotationPointer, weekNumber, baseMondayTs) => {
    const members      = MembersModule.getAll();
    const totalMembers = MembersModule.getCount();
    const weekDates    = _buildWeekDates(baseMondayTs);
    const assignments  = {};

    DAYS.forEach((day, index) => {
      assignments[day.key] = {
        member:      members[(rotationPointer + index) % totalMembers],
        absent:      false,
        replacement: null,
      };
    });

    return {
      assignments,
      pointer:           (rotationPointer + DAYS.length) % totalMembers,
      weekNumber,
      dates:             weekDates,
      baseMondayTs,
      totalReplacements: 0,
    };
  };

  const init = () => {
    const saved = StorageModule.load();
    _state = saved ?? _buildWeekState(0, 1, _getThisMonday());
    if (!saved) StorageModule.save(_state);
    EventBus.publish('stateChanged', _state);
  };

  const newWeek = () => {
    const nextMondayTs = _state.baseMondayTs + MS_PER_WEEK;
    _state = _buildWeekState(_state.pointer, _state.weekNumber + 1, nextMondayTs);
    StorageModule.save(_state);
    EventBus.publish('stateChanged', _state);
    EventBus.publish('toast', '✓ Nueva semana generada correctamente');
  };

  const markAbsent = dayKey => {
    const slot = _state.assignments[dayKey];
    if (slot.absent) return;

    const occupied = new Set(
      Object.values(_state.assignments)
        .flatMap(s => [s.member, s.replacement])
        .filter(Boolean)
    );

    // Clean Code: nombre de variable explica su propósito
    const availableMembers = MembersModule.getAll().filter(m => !occupied.has(m));

    if (availableMembers.length === 0) {
      EventBus.publish('toast', '⚠ No hay miembros disponibles para reemplazar');
      return;
    }

    const replacement      = _pickRandom(availableMembers);
    slot.absent            = true;
    slot.replacement       = replacement;
    _state.totalReplacements++;

    StorageModule.save(_state);
    EventBus.publish('stateChanged', _state);
    EventBus.publish('toast', `↺ ${replacement.split(' ')[0]} reemplaza a ${slot.member.split(' ')[0]}`);
  };

  const reset = () => {
    StorageModule.clear();
    _state = _buildWeekState(0, 1, _getThisMonday());
    StorageModule.save(_state);
    EventBus.publish('stateChanged', _state);
    EventBus.publish('toast', '⚠ Datos reseteados. Rotación reiniciada');
  };

  const getState = () => _state;
  const getDays  = () => DAYS;

  return { init, newWeek, markAbsent, reset, getState, getDays };
})();


const Renderer = (() => {
  // Clean Code: función privada enfocada en renderizar solo las tarjetas
  const _renderDayCards = state => {
    const grid = document.getElementById('daysGrid');
    const days = AssignmentModule.getDays();

    grid.innerHTML = days.map((day, index) => {
      const slot  = state.assignments[day.key];
      const isOut = slot.absent; // Clean Code: variable booleana con nombre claro
      return `
        <div class="card">
          <div class="card-strip" style="background:${day.color}"></div>
          <div class="card-head">
            <div class="card-day" style="color:${day.color}">${day.label}</div>
            <div class="card-date">${state.dates[index]}</div>
          </div>
          <div class="card-body">
            <div class="c-assigned${isOut ? ' out' : ''}">${slot.member}</div>
            ${isOut ? `
              <div class="c-repl-label">↺ reemplazado por</div>
              <div class="c-repl-name">${slot.replacement}</div>
            ` : ''}
          </div>
          <div class="card-foot">
            <button class="btn-absent${isOut ? ' done' : ''}" data-day="${day.key}" ${isOut ? 'disabled' : ''}>
              ${isOut ? '✓ Ausencia registrada' : '⚑ Marcar ausente'}
            </button>
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.btn-absent:not(:disabled)').forEach(button =>
      button.addEventListener('click', () => AssignmentModule.markAbsent(button.dataset.day))
    );
  };

  // Clean Code: función separada para estadísticas, no mezclada con tarjetas
  const _renderStats = state => {
    document.getElementById('weekLabel').textContent =
      `> Semana ${state.weekNumber}  ·  ${state.dates[0]} — ${state.dates[4]}`;
    document.getElementById('weekPill').textContent =
      `Rotación desde #${((state.weekNumber - 1) * 5 % MembersModule.getCount()) + 1}`;
    document.getElementById('sWeek').textContent   = `#${state.weekNumber}`;
    document.getElementById('sActive').textContent = Object.values(state.assignments).filter(s => !s.absent).length;
    document.getElementById('sRepl').textContent   = state.totalReplacements;
  };

  const _renderMembersGrid = state => {
    const days      = AssignmentModule.getDays();
    const roleIndex = {}; // Clean Code: nombre describe qué contiene

    days.forEach(day => {
      const slot     = state.assignments[day.key];
      const dayShort = day.label.slice(0, 3).toUpperCase();
      roleIndex[slot.member] = { label: dayShort, color: day.color, isAbsent: slot.absent };
      if (slot.absent && slot.replacement) {
        roleIndex[slot.replacement] = { label: dayShort, color: '#4CAF6B', isReplacement: true };
      }
    });

    document.getElementById('membersGrid').innerHTML =
      MembersModule.getAll().map(name => {
        const role = roleIndex[name];
        let tagHtml = '';
        if (role) {
          if (role.isAbsent) {
            tagHtml = `<span class="m-chip-tag" style="background:rgba(224,85,85,.15);color:#E05555">AUS</span>`;
          } else if (role.isReplacement) {
            tagHtml = `<span class="m-chip-tag" style="background:rgba(76,175,107,.15);color:#4CAF6B">REPL</span>`;
          } else {
            tagHtml = `<span class="m-chip-tag" style="background:${role.color}22;color:${role.color}">${role.label}</span>`;
          }
        }
        return `
          <div class="m-chip${role ? ' active' : ''}">
            <span class="m-chip-name">${name}</span>${tagHtml}
          </div>`;
      }).join('');
  };

  // Clean Code: función maestra que orquesta las 3 sub-funciones
  const render = state => {
    _renderDayCards(state);
    _renderStats(state);
    _renderMembersGrid(state);
  };

  let _toastTimeout;
  const showToast = message => {
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    toastEl.classList.add('on');
    clearTimeout(_toastTimeout);
    _toastTimeout = setTimeout(() => toastEl.classList.remove('on'), 2800);
  };

  return { render, showToast };
})();


const ModalModule = (() => {
  let _pendingCallback = null;

  const _overlay    = document.getElementById('overlay');
  const _titleEl    = document.getElementById('mTitle');
  const _bodyEl     = document.getElementById('mBody');
  const _btnCancel  = document.getElementById('mCancel');
  const _btnConfirm = document.getElementById('mConfirm');

  const _show = (title, body, onConfirm) => {
    _titleEl.textContent = title;
    _bodyEl.textContent  = body;
    _pendingCallback     = onConfirm;
    _overlay.classList.add('on');
  };

  const _hide = () => {
    _overlay.classList.remove('on');
    _pendingCallback = null;
  };

  _btnConfirm.addEventListener('click', () => {
    // Clean Code: variable local con nombre que explica su intención
    const callbackToRun = _pendingCallback;
    _hide();
    if (callbackToRun) callbackToRun();
  });

  _btnCancel.addEventListener('click', _hide);

  _overlay.addEventListener('click', event => {
    if (event.target === _overlay) _hide();
  });

  return { show: _show };
})();


const App = (() => {
  const init = () => {
    EventBus.subscribe('stateChanged', Renderer.render);
    EventBus.subscribe('toast',        Renderer.showToast);

    document.getElementById('btnNewWeek').addEventListener('click', () => {
      ModalModule.show(
        'Nueva semana',
        'Se generarán asignaciones para la próxima semana respetando la rotación actual. ¿Continuar?',
        AssignmentModule.newWeek
      );
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      ModalModule.show(
        'Resetear todo',
        'Se borrarán todos los datos y se reiniciará la rotación desde el principio. Esta acción no se puede deshacer.',
        AssignmentModule.reset
      );
    });

    AssignmentModule.init();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);