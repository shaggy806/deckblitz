import { defineCard } from "../define.js";

export default defineCard({
  name: "Tinybones, Pocket Nuisance",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Skeleton", "Rogue"],
  power: 2,
  toughness: 1,
  text: "When Tinybones enters, each opponent discards a card.\nWhenever a player discards one or more cards, Tinybones deals 1 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-opponent", amount: 1 },
      resolve: null,
      text: "When Tinybones enters, each opponent discards a card.",
    },
    {
      // Once per discard event, whoever discards — Magmakin Artillerist's
      // batch trigger with any player, and a flat 1 rather than "that much".
      trigger: { on: "discards", who: "any" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "Whenever a player discards one or more cards, Tinybones deals 1 damage to each opponent.",
    },
  ],
});
