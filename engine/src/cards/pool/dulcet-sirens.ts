import { defineCard } from "../define.js";

// Obeyed only by attacking that opponent (rule 508.1d).
const TAP_TEXT = "{U}, {T}: Target creature attacks target opponent this turn if able.";

export default defineCard({
  name: "Dulcet Sirens",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren"],
  power: 1,
  toughness: 3,
  morph: { keyword: "morph", cost: "{U}" },
  text: `${TAP_TEXT}\nMorph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)`,
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: ["creature", "opponent"],
      effect: { kind: "attack-requirement", target: 0, attacks: 1, duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
