import { defineCard } from "../define.js";

const TEXT =
  "{2}{R}, Discard a card at random: This creature deals 2 damage to any target. If the discarded card was multicolored, this creature deals 4 damage instead.";

export default defineCard({
  name: "Stormscale Anarch",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}", tap: false, discard: { count: 1, random: true } },
      targets: ["any-target"],
      effect: {
        kind: "conditional",
        condition: { kind: "discarded", filter: { multicolored: true } },
        then: { kind: "damage", amount: 4, target: 0 },
        else: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
