import { defineCard } from "../define.js";

// EDHREC rank 11724.
//
// Converge is Crystalline Crawler's replacement. The cast trigger marks the
// spell (Yuna, Grand Summoner's `enters-with-counters`) with the colours
// spent on it, read off the spell as the trigger resolves; a copy or a free
// cast spent none (the rulings).
const CONVERGE_TEXT =
  "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";
const CAST_TEXT =
  "Whenever you cast a creature spell, that creature enters with X additional +1/+1 counters on it, where X is the number of colors of mana spent to cast it.";

export default defineCard({
  name: "Wildgrowth Archaic",
  manaCost: "{2/G}{2/G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 0,
  toughness: 0,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${CONVERGE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "enters-with-counters",
        target: "trigger-object",
        counter: "+1/+1",
        amount: { colorsSpentOf: "trigger-object" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
