import { defineCard } from "../define.js";

// "Whenever a Sliver deals damage" watches every Sliver on the battlefield,
// each player's; "its controller" is the Sliver's controller, who gains the
// life when the trigger resolves (the ruling).
export default defineCard({
  name: "Essence Sliver",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: "Whenever a Sliver deals damage, its controller gains that much life.",
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature", subtype: "Sliver" } },
      targets: [],
      effect: { kind: "gain-life", amount: { triggerValue: true }, who: "trigger-controller" },
      resolve: null,
      text: "Whenever a Sliver deals damage, its controller gains that much life.",
    },
  ],
});
