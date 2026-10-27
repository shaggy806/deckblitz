import { defineCard } from "../define.js";

// Onslaught (ONS). EDHREC rank 29196. Requiem Monolith's dealt-damage
// trigger, the amount dealt as the trigger's value.

const TRIGGER_TEXT = "Whenever this creature is dealt damage, you lose that much life.";

export default defineCard({
  name: "Thrashing Mudspawn",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  morph: { keyword: "morph", cost: "{1}{B}{B}" },
  text: `${TRIGGER_TEXT}\nMorph {1}{B}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
