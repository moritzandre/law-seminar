/**
 * modules/promptLogger/index.ts
 * -----------------------------------------------------------------------------
 * Setzt das Modul "Prompt-Logger" zusammen: geteilte Logik (inkl. aggregate und
 * tally) aus @shared plus die beiden React-Views.
 */

import { promptLoggerLogic } from '@shared/moduleLogic';
import type {
  PromptLogAggregate,
  PromptLogConfig,
  PromptLogSubmission,
} from '@shared/types';
import type { ModuleDefinition } from '../types';
import { ParticipantView } from './ParticipantView';
import { TrainerView } from './TrainerView';
import './promptlog.css';

export const promptLoggerModule: ModuleDefinition<
  PromptLogConfig,
  PromptLogSubmission,
  PromptLogAggregate
> = {
  ...promptLoggerLogic,
  ParticipantView,
  TrainerView,
};
