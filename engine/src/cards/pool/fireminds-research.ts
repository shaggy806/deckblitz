import { defineCard } from "../define.js";

// EDHREC rank 13547. Guilds of Ravnica. Weather Maker's charge-counter costs.

export default defineCard({
  name: "Firemind's Research",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  text: "Whenever you cast an instant or sorcery spell, put a charge counter on this enchantment.\n{1}{U}, Remove two charge counters from this enchantment: Draw a card.\n{1}{R}, Remove five charge counters from this enchantment: It deals 5 damage to any target.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, removeCounter: { kind: "charge", count: 2 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{U}, Remove two charge counters from this enchantment: Draw a card.",
    },
    {
      cost: { mana: "{1}{R}", tap: false, removeCounter: { kind: "charge", count: 5 } },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 5, target: 0 },
      resolve: null,
      text: "{1}{R}, Remove five charge counters from this enchantment: It deals 5 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever you cast an instant or sorcery spell, put a charge counter on this enchantment.",
    },
  ],
});
