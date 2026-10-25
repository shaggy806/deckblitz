import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 21601. Warstorm Surge's shape with a payment:
// the target is chosen as the ability triggers, the {2}{R} paid (or not) as
// it resolves, and the creature — read as it last existed if it's gone — is
// the damage's source (the rulings).

const TEXT =
  "Whenever a creature you control enters, you may pay {2}{R}. If you do, that creature deals damage equal to its power to any target.";

export default defineCard({
  name: "Electropotence",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to have that creature deal damage equal to its power to the target?",
        cost: "{2}{R}",
        effect: { kind: "damage", amount: { powerOf: "trigger-object" }, target: 0, from: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
