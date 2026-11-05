import { defineCard } from "../define.js";

// EDHREC rank 13332.

export default defineCard({
  name: "Fortune Thief",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 0,
  toughness: 1,
  morph: { keyword: "morph", cost: "{R}{R}" },
  text: "Damage that would reduce your life total to less than 1 reduces it to 1 instead.\nMorph {R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  static: [
    {
      affects: { scope: "self" },
      damageLifeFloor: 1,
      text: "Damage that would reduce your life total to less than 1 reduces it to 1 instead.",
    },
  ],
});
