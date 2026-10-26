import { defineCard } from "../define.js";

// EDHREC rank 24380.
//
// Rulings:
//   [2011-01-22] If Soul Seizer leaves the battlefield in response to its triggered ability, you
//     won't be able to transform it and it won't return to the battlefield or become attached to
//     the target.
//   [2011-01-22] You choose the target for Soul Seizer's triggered ability when that ability
//     triggers and goes on the stack. You choose whether or not to transform it when that ability
//     resolves. If the creature is an illegal target by that time, the ability doesn't resolve and
//     none of its effects happen. You can't have Soul Seizer transform.
//   [2011-01-22] If Soul Seizer has any +1/+1 counters on it when it transforms, they remain on
//     Ghastly Haunting. They won't affect the power or toughness of the enchanted creature,
//     however.
//
// The target is chosen as the trigger goes on the stack; the "you may" is the
// transform, and the attach rides with it ("if you do"). A Soul Seizer that
// has left can't transform, and the attach of a source that's gone does
// nothing.

const TRIGGER =
  "When this creature deals combat damage to a player, you may transform it. If you do, attach it to target creature that player controls.";

export default defineCard({
  name: "Soul Seizer",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER}`,
  faces: ["Soul Seizer", "Ghastly Haunting"],
  transform: true,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Transform Soul Seizer and attach it to that creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "transform", target: "source" },
            { kind: "attach", target: 0 },
          ],
        },
      },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
