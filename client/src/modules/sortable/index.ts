/**
 * modules/sortable/index.ts
 * -----------------------------------------------------------------------------
 * Die drei Sortier-Module, gebaut aus dem gemeinsamen Muster (createSortModule)
 * und den jeweiligen geteilten Logiken.
 */

import {
  dataStaircaseLogic,
  riskTrafficLightLogic,
  threeLevelSorterLogic,
} from '@shared/moduleLogic';
import { createSortModule } from './createSortModule';

export const dataStaircaseModule = createSortModule(dataStaircaseLogic);
export const threeLevelSorterModule = createSortModule(threeLevelSorterLogic);
export const riskTrafficLightModule = createSortModule(riskTrafficLightLogic);
