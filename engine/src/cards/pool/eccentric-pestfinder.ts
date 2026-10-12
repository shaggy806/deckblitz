import { defineCard } from "../define.js";

// EDHREC rank 7063. A preparation card (rule 722): its prepare spell is Turn
// Stones, which is no card of its own. "If you gained life this turn" is an
// intervening if (rule 603.4), checked as each end step begins — life gained
// during the end step is too late (the ruling) — and again as it resolves.
const END_TEXT = "At the beginning of each end step, if you gained life this turn, this creature becomes prepared.";

export default defineCard({
  name: "Eccentric Pestfinder",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  prepareSpell: "Turn Stones",
  text: `Trample\n${END_TEXT} (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
