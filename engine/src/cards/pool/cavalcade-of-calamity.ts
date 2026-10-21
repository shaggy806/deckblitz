import { defineCard } from "../define.js";

// EDHREC rank 9798. Raid Bombardment's trigger at power 1 or less: the power
// is checked only as it triggers (the ruling), and the damage goes to
// whichever player or planeswalker that creature is attacking.
const TEXT =
  "Whenever a creature you control with power 1 or less attacks, this enchantment deals 1 damage to the player or planeswalker that creature is attacking.";

export default defineCard({
  name: "Cavalcade of Calamity",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { type: "creature", power: { op: "lte", n: 1 } } },
      targets: [],
      effect: { kind: "damage", amount: 1, toTriggerRecipient: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
