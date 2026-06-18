/**
 * hooks/useParticipant.ts
 * -----------------------------------------------------------------------------
 * Kapselt die Teilnehmer-Seite des Raum-Lebenszyklus: beitreten, dem aktuellen
 * Modul folgen, Einsendungen schicken und die Aufloesung empfangen.
 */

import { useEffect, useMemo, useState } from 'react';
import type { ModuleState } from '@shared/types';
import { getParticipantId } from '../lib/identity';
import { socket } from '../socket';

type JoinStatus = 'idle' | 'joining' | 'joined' | 'error';

export interface ParticipantRoom {
  status: JoinStatus;
  error: string | null;
  module: ModuleState | null;
  submitted: boolean;
  aggregate: unknown;
  join: (code: string) => void;
  sendSubmission: (payload: unknown) => void;
}

export function useParticipant(): ParticipantRoom {
  // Stabile, anonyme ID fuer die Dauer der Session.
  const pid = useMemo(getParticipantId, []);

  const [status, setStatus] = useState<JoinStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<ModuleState | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [aggregate, setAggregate] = useState<unknown>(null);

  useEffect(() => {
    function onJoined(payload: {
      ok: boolean;
      error?: string;
      module?: ModuleState | null;
    }) {
      if (payload.ok) {
        setStatus('joined');
        setError(null);
        setModule(payload.module ?? null);
        setSubmitted(false);
        setAggregate(null);
      } else {
        setStatus('error');
        setError(payload.error ?? 'Beitritt fehlgeschlagen.');
      }
    }

    function onStarted(payload: {
      moduleId: string;
      config: unknown;
      phase: 'collecting';
    }) {
      // Neues Modul -> alles zuruecksetzen (frische Schaetzphase).
      setModule({
        moduleId: payload.moduleId,
        config: payload.config,
        phase: payload.phase,
      });
      setSubmitted(false);
      setAggregate(null);
    }

    function onPhase(payload: { phase: 'revealed'; aggregate: unknown }) {
      setModule((m) => (m ? { ...m, phase: payload.phase } : m));
      setAggregate(payload.aggregate);
    }

    function onReset() {
      setModule(null);
      setSubmitted(false);
      setAggregate(null);
    }

    socket.on('room:joined', onJoined);
    socket.on('module:started', onStarted);
    socket.on('phase:updated', onPhase);
    socket.on('module:reset', onReset);

    return () => {
      socket.off('room:joined', onJoined);
      socket.off('module:started', onStarted);
      socket.off('phase:updated', onPhase);
      socket.off('module:reset', onReset);
    };
  }, []);

  function join(code: string) {
    setStatus('joining');
    setError(null);
    socket.emit('room:join', { code, pid });
  }

  function sendSubmission(payload: unknown) {
    if (!module) return;
    socket.emit('submission:send', {
      moduleId: module.moduleId,
      payload,
      pid,
    });
    setSubmitted(true);
  }

  return { status, error, module, submitted, aggregate, join, sendSubmission };
}
