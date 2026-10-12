import { defineCard } from "../define.js";

export default defineCard({
  name: "Abzan Guide",
  manaCost: "{3}{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["lifelink"],
  morph: { keyword: "morph", cost: "{2}{W}{B}{G}" },
  text: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nMorph {2}{W}{B}{G} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
