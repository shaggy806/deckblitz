import { defineCard } from "../define.js";

// EDHREC rank 31057.

export default defineCard({
  name: "Pardic Swordsmith",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  text: "{R}, Discard a card at random: This creature gets +2/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false, discard: { count: 1, random: true } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}, Discard a card at random: This creature gets +2/+0 until end of turn.",
    },
  ],
});
