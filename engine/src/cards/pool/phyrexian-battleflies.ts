import { defineCard } from "../define.js";

// EDHREC rank 26537.

export default defineCard({
  name: "Phyrexian Battleflies",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{B}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.",
      timesEachTurn: 2,
    },
  ],
});
