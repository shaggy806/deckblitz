import { defineCard } from "../define.js";

export default defineCard({
  name: "Battering Craghorn",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goat", "Beast"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike"],
  morph: { keyword: "morph", cost: "{1}{R}{R}" },
  text: "First strike\nMorph {1}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
