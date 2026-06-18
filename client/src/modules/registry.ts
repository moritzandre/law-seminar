/**
 * modules/registry.ts
 * -----------------------------------------------------------------------------
 * Zentrale Modul-Registry des Clients. Das Dashboard liest hieraus die Auswahl
 * (gruppiert nach Block); die Teilnehmer-Ansicht findet hierueber das aktuell
 * laufende Modul anhand seiner id.
 *
 * Reihenfolge: Modul 1 (vollstaendig) zuerst, danach die Platzhalter.
 */

import type { AnyModuleDefinition } from './types';
import { livePollModule } from './livePoll';
import { promptLoggerModule } from './promptLogger';
import { architectureMapModule } from './architectureMap';
import { estimateBracketModule } from './estimateBracket';
import {
  dataStaircaseModule,
  riskTrafficLightModule,
  threeLevelSorterModule,
} from './sortable';
import { placeholderModules } from './placeholders';

export const modules: AnyModuleDefinition[] = [
  livePollModule,
  promptLoggerModule,
  architectureMapModule,
  estimateBracketModule,
  dataStaircaseModule,
  threeLevelSorterModule,
  riskTrafficLightModule,
  ...placeholderModules,
];

/** Findet eine Modul-Definition anhand ihrer id. */
export function getModule(id: string): AnyModuleDefinition | undefined {
  return modules.find((m) => m.id === id);
}

/** Module nach Seminarblock gruppiert (fuer die Dashboard-Auswahl). */
export function modulesByBlock(): Array<{
  block: number;
  modules: AnyModuleDefinition[];
}> {
  const blocks = [...new Set(modules.map((m) => m.block))].sort((a, b) => a - b);
  return blocks.map((block) => ({
    block,
    modules: modules.filter((m) => m.block === block),
  }));
}
