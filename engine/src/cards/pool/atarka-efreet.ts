import { defineCard } from "../define.js";

// EDHREC rank 29043. Megamorph (rule 702.37b): the +1/+1 counter only when
// it's turned up for its megamorph cost; the trigger however it's turned face up.
const UP_TEXT = "When this creature is turned face up, it deals 1 damage to any target.";

export default defineCard({
  name: "Atarka Efreet",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Efreet", "Shaman"],
  power: 5,
  toughness: 1,
  morph: { keyword: "megamorph", cost: "{2}{R}" },
  text: `Megamorph {2}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
