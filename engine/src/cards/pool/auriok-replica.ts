import { defineCard } from "../define.js";

// EDHREC rank 25963.

export default defineCard({
  name: "Auriok Replica",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Cleric"],
  power: 2,
  toughness: 2,
  text: "{W}, Sacrifice this creature: Prevent all damage a source of your choice would deal to you this turn.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "all" },
      resolve: null,
      text: "{W}, Sacrifice this creature: Prevent all damage a source of your choice would deal to you this turn.",
    },
  ],
});
