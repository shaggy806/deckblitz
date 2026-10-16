import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 21356. The Lost Caverns of Ixalan.
//
// Selfcraft Mechan's "you may sacrifice …. When you do, …": the targets are
// chosen only by the reflexive trigger, as it goes on the stack (the ruling;
// rule 603.12). "Another": never this creature itself.

const TEXT =
  "When this creature enters, you may sacrifice another creature or artifact. When you do, put a +1/+1 counter on each of up to two target creatures.";

export default defineCard({
  name: "Glorifier of Suffering",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact"] },
            exceptSource: true,
            text: "Sacrifice another creature or artifact",
          },
        ],
        ifDid: {
          kind: "reflexive-trigger",
          targets: distinctTargets(2, "creature", { optional: true }),
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
              { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
            ],
          },
          text: "When you do, put a +1/+1 counter on each of up to two target creatures.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
