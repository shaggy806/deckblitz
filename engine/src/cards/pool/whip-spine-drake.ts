import { defineCard } from "../define.js";

export default defineCard({
  name: "Whip-Spine Drake",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{W}" },
  text: "Flying\nMorph {2}{W} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
});
