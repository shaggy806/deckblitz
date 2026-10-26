import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 28536.
//
// Rulings:
//   [2007-02-01] You choose whether the targeted creature gets +2/-2 or -2/+2 as the ability
//     resolves.

const TRIGGER_TEXT = "When this creature is turned face up, target creature gets +2/-2 or -2/+2 until end of turn.";

export default defineCard({
  name: "Shaper Parasite",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 3,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `Morph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      // Not announced: the choice is made as it resolves (the ruling).
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "+2/-2", effect: { kind: "modify-pt", target: 0, power: 2, toughness: -2, duration: "end-of-turn" } },
          { text: "-2/+2", effect: { kind: "modify-pt", target: 0, power: -2, toughness: 2, duration: "end-of-turn" } },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
