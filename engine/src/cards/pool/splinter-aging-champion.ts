import { defineCard } from "../define.js";

// EDHREC rank 16480. "Another target player" is any player but Splinter's
// controller (the `opponent` slot); with that target illegal the ability
// doesn't resolve and nobody draws (the ruling).
//
// Rulings:
//   If the target player is an illegal target when Splinter's last ability tries to resolve, it
//     won't resolve and none of its effects will happen. You won't draw a card.
const ENTER_TEXT = "When Splinter enters, destroy up to one target tapped creature.";
const LEAVE_TEXT = "When Splinter leaves the battlefield, you and another target player each draw a card.";

export default defineCard({
  name: "Splinter, Aging Champion",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Rat"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "any", filter: { type: "creature", tapped: true } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "draw", amount: 1, target: 0 },
        ],
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
