import { defineCard } from "../define.js";

// EDHREC rank 19849.
//
// Discarding none is not doing it: the reflexive trigger needs at least one
// card discarded, and its group is bounded by how many were (targets chosen
// as it goes on the stack — the ruling).

const TEXT =
  "When this creature enters, you may discard any number of cards. When you do, up to that many target creatures each get -2/-2 until end of turn.";

export default defineCard({
  name: "Miasma Demon",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 0, anyNumber: true },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
              value: { thisWay: "discarded" },
              effect: {
                kind: "for-each-target",
                from: 0,
                effect: { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" },
              },
              text: "When you do, up to that many target creatures each get -2/-2 until end of turn.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
