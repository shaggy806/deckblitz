import { defineCard } from "../define.js";

// Kaldheim. EDHREC rank 27962.
//
// "Whenever you activate a boast ability" is `activates-ability` with
// `boast` (rule 702.142b), any creature's, a granted one included. The
// trigger resolves before the boast ability that caused it (its ruling).

const TEXT = "Whenever you activate a boast ability, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Frenzied Raider",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Demon", "Berserker"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", boast: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
