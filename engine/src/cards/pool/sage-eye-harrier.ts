import { defineCard } from "../define.js";

export default defineCard({
  name: "Sage-Eye Harrier",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 1,
  toughness: 5,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{3}{W}" },
  text: "Flying\nMorph {3}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
