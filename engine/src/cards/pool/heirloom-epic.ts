import { defineCard } from "../define.js";

// EDHREC rank 10432. "For each mana in this ability's activation cost, you
// may tap an untapped creature you control rather than pay that mana" is
// `tapCreaturesForMana`: waterbend's way of paying with creatures alone, and
// no waterbending. As many creatures may tap as the total cost has generic
// mana once increases and reductions apply (the rulings), summoning-sick ones
// included; a creature tapped for mana to pay it can't tap for it too.

const TEXT =
  "{4}, {T}: Draw a card. For each mana in this ability's activation cost, you may tap an untapped creature you control rather than pay that mana. Activate only as a sorcery.";

export default defineCard({
  name: "Heirloom Epic",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{4}", tap: true, tapCreaturesForMana: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      sorcerySpeed: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
