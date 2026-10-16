import { defineCard } from "../define.js";

// Disguise {4}{W} (rule 702.168): cast face down for {3} as a 2/2 with ward
// {2}, turned face up for its disguise cost.

export default defineCard({
  name: "Defenestrated Phantom",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nDisguise {4}{W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)",
  morph: { keyword: "disguise", cost: "{4}{W}" },
});
