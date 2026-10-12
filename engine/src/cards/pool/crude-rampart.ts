import { defineCard } from "../define.js";

export default defineCard({
  name: "Crude Rampart",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 4,
  toughness: 5,
  keywords: ["defender"],
  morph: { keyword: "morph", cost: "{4}{W}" },
  text: "Defender (This creature can't attack.)\nMorph {4}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
