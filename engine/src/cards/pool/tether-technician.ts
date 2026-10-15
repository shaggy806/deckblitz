import { defineCard } from "../define.js";

// EDHREC rank 31184.
//
// The Restoration of Eiganjo's "you may discard a card. When you do" shape:
// the reflexive ability (rule 603.12) triggers only once a card was
// discarded, and its target is chosen then.
const ENTERS_TEXT =
  "When this creature enters, you may discard a card. When you do, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Tether Technician",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Artificer"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: {
                kind: "reflexive-trigger",
                targets: ["any-target"],
                effect: { kind: "damage", amount: 2, target: 0 },
                text: "When you do, this creature deals 2 damage to any target.",
              },
            },
          ],
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
