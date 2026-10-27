import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31222. Pyromania's random-discard cost, two cards.
const TEXT = "{2}{R}{G}, Discard two cards at random: This enchantment deals 4 damage to any target.";

export default defineCard({
  name: "Meteor Storm",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{R}{G}", tap: false, discard: { count: 2, random: true } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
