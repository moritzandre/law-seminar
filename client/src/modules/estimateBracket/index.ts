/**
 * modules/estimateBracket/index.ts
 * -----------------------------------------------------------------------------
 * Setzt das Modul "Schaetz-Klammer" zusammen: geteilte Logik aus @shared plus
 * die beiden React-Views. Der runden-spezifische Editor (EstimateSetup) wird im
 * Dashboard verwendet.
 */

import { estimateBracketLogic } from '@shared/moduleLogic';
import type {
  EstimateAggregate,
  EstimateConfig,
  EstimateSubmission,
} from '@shared/types';
import type { ModuleDefinition } from '../types';
import { ParticipantView } from './ParticipantView';
import { TrainerView } from './TrainerView';

export const estimateBracketModule: ModuleDefinition<
  EstimateConfig,
  EstimateSubmission,
  EstimateAggregate
> = {
  ...estimateBracketLogic,
  ParticipantView,
  TrainerView,
};
