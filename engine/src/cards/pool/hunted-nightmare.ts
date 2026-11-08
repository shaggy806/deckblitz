import { defineCard } from "../define.js";

// EDHREC rank 22496. Only the opponent is targeted: they choose which of their
// creatures takes the counter, and they are the one putting it on.

const ENTERS = "When this creature enters, target opponent puts a deathtouch counter on a creature they control.";

export default defineCard({
  name: "Hunted Nightmare",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "vote",
            choose: true,
            who: { target: 0 },
            for: { permanent: { type: "creature", controlledBy: "you" }, own: true },
          },
          {
            kind: "for-each-voted",
            which: "voted",
            effect: { kind: "add-counter", target: 0, counter: "deathtouch", amount: 1, by: { controllerOf: 0 } },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
