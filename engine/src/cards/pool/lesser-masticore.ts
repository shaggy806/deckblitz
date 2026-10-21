import { defineCard } from "../define.js";
import { persist } from "../helpers.js";

// EDHREC rank 7666.
//
// Rulings:
//   [2019-06-14] You must discard exactly one card to cast Lesser Masticore; you can't cast it
//     without discarding a card, and you can't discard additional cards. If Lesser Masticore
//     enters the battlefield without being cast (perhaps because of its persist ability) you don't
//     discard a card.

export default defineCard({
  name: "Lesser Masticore",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Masticore"],
  power: 2,
  toughness: 2,
  text: "As an additional cost to cast this spell, discard a card.\n{4}: This creature deals 1 damage to target creature.\nPersist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)",
  additionalCost: { discard: 1 },
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: "{4}: This creature deals 1 damage to target creature.",
    },
  ],
  triggered: [persist()],
});
