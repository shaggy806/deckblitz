import { defineCard } from "../define.js";

// EDHREC rank 31566.

export default defineCard({
  name: "Pilgrim of Justice",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: "Protection from red\n{W}, Sacrifice this creature: The next time a red source of your choice would deal damage this turn, prevent that damage.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "prevent-damage-from-chosen-source",
        filter: { colors: ["R"] },
        to: "any",
        amount: "next-time",
      },
      resolve: null,
      text: "{W}, Sacrifice this creature: The next time a red source of your choice would deal damage this turn, prevent that damage.",
    },
  ],
  static: [{ affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" }],
});
