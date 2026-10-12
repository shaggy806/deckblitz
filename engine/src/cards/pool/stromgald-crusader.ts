import { defineCard } from "../define.js";

export default defineCard({
  name: "Stromgald Crusader",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 2,
  toughness: 1,
  text: "Protection from white\n{B}: This creature gains flying until end of turn.\n{B}{B}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{B}{B}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W"] },
      text: "Protection from white",
    },
  ],
});
