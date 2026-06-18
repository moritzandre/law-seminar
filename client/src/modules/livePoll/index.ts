/**
 * modules/livePoll/index.ts
 * -----------------------------------------------------------------------------
 * Setzt Modul 1 ("Live-Abstimmung") zusammen: geteilte Logik aus @shared plus
 * die beiden React-Views. Die aggregate()-Funktion stammt bewusst aus der
 * geteilten Logik, damit Server und Client identisch rechnen.
 */

import { livePollLogic } from '@shared/moduleLogic';
import type {
  PollAggregate,
  PollConfig,
  PollSubmission,
} from '@shared/types';
import type { ModuleDefinition } from '../types';
import { ParticipantView } from './ParticipantView';
import { TrainerView } from './TrainerView';
import './poll.css';

export const livePollModule: ModuleDefinition<
  PollConfig,
  PollSubmission,
  PollAggregate
> = {
  ...livePollLogic,
  ParticipantView,
  TrainerView,
};
