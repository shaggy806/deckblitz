import { defineCard } from "../define.js";

export default defineCard({
  name: "Mystic of the Hidden Way",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 2,
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: "This creature can't be blocked.\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
