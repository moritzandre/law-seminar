/**
 * hooks/useTrainer.ts
 * -----------------------------------------------------------------------------
 * Kapselt die Trainer-Seite des Raum-Lebenszyklus: Raum erstellen, Teilnehmerzahl
 * verfolgen, Module starten, zwischen collecting/revealed schalten und das
 * Aggregat empfangen.
 */

import { useEffect, useState } from 'react';
import type { Phase } from '@shared/types';
import { socket } from '../socket';

export interface TrainerModuleState {
  moduleId: string;
  config: unknown;
  phase: Phase;
}

export interface TrainerRoom {
  code: string | null;
  participantCount: number;
  module: TrainerModuleState | null;
  submissionCount: number;
  /** Nicht-sensible Live-Auswertung waehrend collecting (modul-spezifisch). */
  tally: unknown;
  aggregate: unknown;
  createRoom: () => void;
  startModule: (moduleId: string, config: unknown) => void;
  reveal: () => void;
  reset: () => void;
}

export function useTrainer(): TrainerRoom {
  const [code, setCode] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [module, setModule] = useState<TrainerModuleState | null>(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [tally, setTally] = useState<unknown>(null);
  const [aggregate, setAggregate] = useState<unknown>(null);

  useEffect(() => {
    function onCreated(payload: { code: string }) {
      setCode(payload.code);
    }
    function onParticipants(payload: { count: number }) {
      setParticipantCount(payload.count);
    }
    function onStarted(payload: {
      moduleId: string;
      config: unknown;
      phase: 'collecting';
    }) {
      setModule({
        moduleId: payload.moduleId,
        config: payload.config,
        phase: payload.phase,
      });
      setAggregate(null);
      setSubmissionCount(0);
      setTally(null);
    }
    function onCount(payload: { count: number; tally?: unknown }) {
      setSubmissionCount(payload.count);
      setTally(payload.tally ?? null);
    }
    function onPhase(payload: { phase: 'revealed'; aggregate: unknown }) {
      setModule((m) => (m ? { ...m, phase: payload.phase } : m));
      setAggregate(payload.aggregate);
    }
    function onReset() {
      setModule(null);
      setAggregate(null);
      setSubmissionCount(0);
      setTally(null);
    }

    socket.on('room:created', onCreated);
    socket.on('participants:update', onParticipants);
    socket.on('module:started', onStarted);
    socket.on('submission:count', onCount);
    socket.on('phase:updated', onPhase);
    socket.on('module:reset', onReset);

    return () => {
      socket.off('room:created', onCreated);
      socket.off('participants:update', onParticipants);
      socket.off('module:started', onStarted);
      socket.off('submission:count', onCount);
      socket.off('phase:updated', onPhase);
      socket.off('module:reset', onReset);
    };
  }, []);

  function createRoom() {
    socket.emit('room:create');
  }
  function startModule(moduleId: string, config: unknown) {
    socket.emit('module:start', { moduleId, config });
  }
  function reveal() {
    socket.emit('phase:reveal');
  }
  function reset() {
    socket.emit('module:reset');
  }

  return {
    code,
    participantCount,
    module,
    submissionCount,
    tally,
    aggregate,
    createRoom,
    startModule,
    reveal,
    reset,
  };
}
