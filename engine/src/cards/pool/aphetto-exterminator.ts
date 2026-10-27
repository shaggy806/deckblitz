import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 26103.

const TEXT = "When this creature is turned face up, target creature gets -3/-3 until end of turn.";

export default defineCard({
  name: "Aphetto Exterminator",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 1,
  morph: { keyword: "morph", cost: "{3}{B}" },
  text: `Morph {3}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
