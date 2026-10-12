import { defineCard } from "../define.js";

export default defineCard({
  name: "War Behemoth",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 6,
  morph: { keyword: "morph", cost: "{4}{W}" },
  text: "Morph {4}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
