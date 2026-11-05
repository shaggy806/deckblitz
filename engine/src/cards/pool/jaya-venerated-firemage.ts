import { defineCard } from "../define.js";

// EDHREC rank 13767.

export default defineCard({
  name: "Jaya, Venerated Firemage",
  manaCost: "{4}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jaya"],
  loyalty: 5,
  text: "If another red source you control would deal damage to a permanent or player, it deals that much damage plus 1 to that permanent or player instead.\n−2: Jaya deals 2 damage to any target.",
  activated: [
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "−2: Jaya deals 2 damage to any target.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        plus: 1,
        fromOther: true,
        source: { colors: ["R"], controlledBy: "you" },
      },
      text: "If another red source you control would deal damage to a permanent or player, it deals that much damage plus 1 to that permanent or player instead.",
    },
  ],
});
