import { defineCard } from "../define.js";

// Rulings:
//   [2024-04-12] Choosing a creature that's already been declared as a blocker as the target of
//     the second mode of the activated ability won't cause that creature to stop blocking.
//   [2024-04-12] You may target a land that is already untapped with the first mode of Lost
//     Jitte's activated ability.

export default defineCard({
  name: "Lost Jitte",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Whenever equipped creature deals combat damage, put a charge counter on Lost Jitte.\nRemove a charge counter from Lost Jitte: Choose one —\n• Untap target land.\n• Target creature can't block this turn.\n• Put a +1/+1 counter on equipped creature.\nEquip {1}",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "charge", count: 1 } },
      targets: [],
      // Its mode chosen as it's activated, bringing its target (rule 700.2b);
      // "equipped creature" is the one equipped as it resolves.
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Untap target land.", targets: ["land"], effect: { kind: "untap", target: 0 } },
          {
            text: "Target creature can't block this turn.",
            targets: ["creature"],
            effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
          },
          {
            text: "Put a +1/+1 counter on equipped creature.",
            effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "Remove a charge counter from Lost Jitte: Choose one —\n• Untap target land.\n• Target creature can't block this turn.\n• Put a +1/+1 counter on equipped creature.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: "Whenever equipped creature deals combat damage, put a charge counter on Lost Jitte.",
    },
  ],
});
