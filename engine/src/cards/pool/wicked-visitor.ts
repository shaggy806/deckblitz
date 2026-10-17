import { defineCard } from "../define.js";

// EDHREC rank 11409.
//
// An enchantment token you controlled (a Role) is put into a graveyard before
// it ceases to exist, so it triggers this too (the ruling).

export default defineCard({
  name: "Wicked Visitor",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 2,
  toughness: 2,
  text: "Whenever an enchantment you control is put into a graveyard from the battlefield, each opponent loses 1 life.",
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever an enchantment you control is put into a graveyard from the battlefield, each opponent loses 1 life.",
    },
  ],
});
