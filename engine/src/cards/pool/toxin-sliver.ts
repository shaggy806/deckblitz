import { defineCard } from "../define.js";

// Every Sliver on the battlefield, each player's: the trigger is Toxin
// Sliver's own, so its controller controls the destroy.
export default defineCard({
  name: "Toxin Sliver",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: "Whenever a Sliver deals combat damage to a creature, destroy that creature. It can't be regenerated.",
  triggered: [
    {
      trigger: {
        on: "deals-damage",
        who: "any",
        filter: { type: "creature", subtype: "Sliver" },
        to: "creature",
        combat: true,
      },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient", cantBeRegenerated: true },
      resolve: null,
      text: "Whenever a Sliver deals combat damage to a creature, destroy that creature. It can't be regenerated.",
    },
  ],
});
