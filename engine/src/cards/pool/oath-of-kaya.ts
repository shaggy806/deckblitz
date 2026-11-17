import { defineCard } from "../define.js";

// EDHREC rank 13901.
//
// Rulings:
//   If an opponent attacks more than one planeswalker you control, the last ability of Oath of
//     Kaya triggers once for each of those attacked planeswalkers.
//   If the target is an illegal target by the time the first ability of Oath of Kaya tries to
//     resolve, the ability doesn't resolve. You won't gain 3 life.

const ENTER_TEXT = "When Oath of Kaya enters, it deals 3 damage to any target and you gain 3 life.";
const ATTACKED =
  "Whenever an opponent attacks a planeswalker you control with one or more creatures, Oath of Kaya deals 2 damage to that player and you gain 2 life.";

export default defineCard({
  name: "Oath of Kaya",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${ATTACKED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 3, target: 0 },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      // Once for each planeswalker attacked (the ruling); "that player" is the
      // attacking opponent.
      trigger: { on: "planeswalker-attacked", who: "opponent", defender: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 2, who: "trigger-player" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ATTACKED,
    },
  ],
});
