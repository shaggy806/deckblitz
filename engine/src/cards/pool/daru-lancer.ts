import { defineCard } from "../define.js";

export default defineCard({
  name: "Daru Lancer",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["first-strike"],
  morph: { keyword: "morph", cost: "{2}{W}{W}" },
  text: "First strike\nMorph {2}{W}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
