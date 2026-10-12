import { defineCard } from "../define.js";

export default defineCard({
  name: "Ainok Tracker",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog", "Scout"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  morph: { keyword: "morph", cost: "{4}{R}" },
  text: "First strike\nMorph {4}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
