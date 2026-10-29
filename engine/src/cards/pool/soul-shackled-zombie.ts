import { defineCard } from "../define.js";

// EDHREC rank 14795.

const TRIGGER_TEXT =
  "When this creature enters, exile up to two target cards from a single graveyard. If at least one creature card was exiled this way, each opponent loses 2 life and you gain 2 life.";

export default defineCard({
  name: "Soul-Shackled Zombie",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 2,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "any" },
          max: 2,
          sameController: true,
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "for-each-target",
            from: 0,
            simultaneous: true,
            effect: { kind: "exile", target: 0 },
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled", filter: { type: "creature" } },
            then: {
              kind: "sequence",
              effects: [
                { kind: "lose-life", amount: 2, who: "each-opponent" },
                { kind: "gain-life", amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
