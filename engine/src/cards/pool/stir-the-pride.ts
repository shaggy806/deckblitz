import { defineCard } from "../define.js";

// EDHREC rank 27684.
//
// Rulings:
//   [2013-06-07] Notably, the ability granted by the second mode isn’t lifelink. It’s a triggered
//     ability that triggers whenever the creature with that ability deals damage. If that creature
//     also has lifelink, you’ll gain life as a result of that damage and also when the triggered
//     ability resolves. Multiple instances of this ability trigger separately.
//   [2013-06-07] Only creatures you control when Stir the Pride resolves will get the bonuses.

const PUMP_TEXT = "Creatures you control get +2/+2 until end of turn.";
const GRANT_TEXT =
  'Until end of turn, creatures you control gain "Whenever this creature deals damage, you gain that much life."';

export default defineCard({
  name: "Stir the Pride",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  kicker: { cost: "{1}{W}", keyword: "entwine" },
  text: "Choose one —\n• Creatures you control get +2/+2 until end of turn.\n• Until end of turn, creatures you control gain \"Whenever this creature deals damage, you gain that much life.\"\nEntwine {1}{W} (Choose both if you pay the entwine cost.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: PUMP_TEXT,
        targets: [],
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: 2,
          toughness: 2,
          duration: "end-of-turn",
        },
      },
      {
        text: GRANT_TEXT,
        targets: [],
        effect: {
          kind: "grant-triggered-all",
          filter: { type: "creature", controlledBy: "you" },
          duration: "end-of-turn",
          ability: {
            trigger: { on: "deals-damage", who: "self" },
            targets: [],
            effect: { kind: "gain-life", amount: { triggerValue: true } },
            resolve: null,
            text: "Whenever this creature deals damage, you gain that much life.",
          },
        },
      },
    ],
    kickedModes: 2,
  },
});
