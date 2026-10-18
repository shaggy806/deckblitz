import { defineCard } from "../define.js";

// EDHREC rank 17064.

export default defineCard({
  name: "Furnace Skullbomb",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: "{1}, Sacrifice this artifact: Draw a card.\n{1}{R}, Sacrifice this artifact: Put two oil counters on target artifact or creature you control. Draw a card. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}, Sacrifice this artifact: Draw a card.",
    },
    {
      cost: { mana: "{1}{R}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "oil", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{1}{R}, Sacrifice this artifact: Put two oil counters on target artifact or creature you control. Draw a card. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
