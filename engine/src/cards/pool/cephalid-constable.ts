import { defineCard } from "../define.js";

// EDHREC rank 12368.
// "Up to that many": the combat damage dealt, read as the trigger's targets are chosen.

const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, return up to that many target permanents that player controls to their owner's hand.";

export default defineCard({
  name: "Cephalid Constable",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Octopus", "Wizard"],
  power: 1,
  toughness: 1,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "permanent", whose: "trigger-player", filter: {} },
          max: { triggerValue: true },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
