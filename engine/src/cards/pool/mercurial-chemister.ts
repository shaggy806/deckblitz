import { defineCard } from "../define.js";

// EDHREC rank 15709.

export default defineCard({
  name: "Mercurial Chemister",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "{U}, {T}: Draw two cards.\n{R}, {T}, Discard a card: This creature deals damage to target creature equal to the discarded card's mana value.",
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "{U}, {T}: Draw two cards.",
    },
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "damage", amount: { manaValueOf: { paid: "discarded" } }, target: 0 },
      resolve: null,
      text: "{R}, {T}, Discard a card: This creature deals damage to target creature equal to the discarded card's mana value.",
    },
  ],
});
