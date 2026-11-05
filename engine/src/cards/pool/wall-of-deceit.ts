import { defineCard } from "../define.js";

// EDHREC rank 22929.

export default defineCard({
  name: "Wall of Deceit",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  morph: { keyword: "morph", cost: "{U}" },
  text: "Defender (This creature can't attack.)\n{3}: Turn this creature face down.\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "turn-face-down", target: "source" },
      resolve: null,
      text: "{3}: Turn this creature face down.",
    },
  ],
});
