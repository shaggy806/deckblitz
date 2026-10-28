import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 2240.
//
// Cumulative upkeep of life (the `cumulativeUpkeep` helper, Dystopia's);
// "sacrifice a land" can take Glacial Chasm itself, and must when it's the
// only land (the ruling) — Foul Spirit's shape. The damage prevention is
// Personal Sanctuary's replacement without its turn condition.

export default defineCard({
  name: "Glacial Chasm",
  colors: [],
  types: ["land"],
  text: "Cumulative upkeep—Pay 2 life. (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhen this land enters, sacrifice a land.\nCreatures you control can't attack.\nPrevent all damage that would be dealt to you.",
  triggered: [
    cumulativeUpkeep({ life: 2 }),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
      resolve: null,
      text: "When this land enters, sacrifice a land.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" } },
      restrictions: ["cant-attack"],
      text: "Creatures you control can't attack.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", prevent: true, to: "you" },
      text: "Prevent all damage that would be dealt to you.",
    },
  ],
});
