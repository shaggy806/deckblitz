import { defineCard } from "../define.js";

export default defineCard({
  name: "Stillmoon Cavalier",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Knight"],
  power: 2,
  toughness: 1,
  text: "Protection from white and from black\n{W/B}: This creature gains flying until end of turn.\n{W/B}: This creature gains first strike until end of turn.\n{W/B}{W/B}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{W/B}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: "{W/B}: This creature gains flying until end of turn.",
    },
    {
      cost: { mana: "{W/B}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W/B}: This creature gains first strike until end of turn.",
    },
    {
      cost: { mana: "{W/B}{W/B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{W/B}{W/B}: This creature gets +1/+0 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["W", "B"] },
      text: "Protection from white and from black",
    },
  ],
});
