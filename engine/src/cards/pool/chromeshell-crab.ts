import { defineCard } from "../define.js";

// Targets are chosen as the trigger goes on the stack, the exchange on
// resolution (the rulings). It fails, all or nothing (rule 701.12a), if
// either has left, you no longer control yours, or you now control theirs.

const TRIGGER_TEXT =
  "When this creature is turned face up, you may exchange control of target creature you control and target creature an opponent controls.";

export default defineCard({
  name: "Chromeshell Crab",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab", "Beast"],
  power: 3,
  toughness: 3,
  morph: { keyword: "morph", cost: "{4}{U}" },
  text: `Morph {4}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature-you-control", "creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Exchange control of the two target creatures?",
        effect: { kind: "exchange-control", objects: [0, 1] },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
