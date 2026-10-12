import { defineCard } from "../define.js";

export default defineCard({
  name: "Aven Sunstriker",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["flying", "double-strike"],
  morph: { keyword: "megamorph", cost: "{4}{W}" },
  text: "Flying\nDouble strike (This creature deals both first-strike and regular combat damage.)\nMegamorph {4}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
});
