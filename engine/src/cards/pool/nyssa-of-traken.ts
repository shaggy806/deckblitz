import { defineCard } from "../define.js";

const BOOSTER_TEXT =
  "Sonic Booster — Whenever Nyssa of Traken attacks, sacrifice any number of artifacts. When you sacrifice one or more artifacts this way, tap up to that many target creatures and draw that many cards.";

const ARTIFACTS = { type: "artifact", controlledBy: "you" } as const;

// The reflexive ability carries the number sacrificed as its value: the bound
// of its group and the cards drawn, however few targets are chosen (ruling).
// With every chosen target illegal it does nothing at all (608.2b, ruling).
export default defineCard({
  name: "Nyssa of Traken",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 4,
  pairing: { kind: "doctors-companion" },
  text: `You have no maximum hand size.\n${BOOSTER_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [{ affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: ARTIFACTS,
            min: 0,
            upTo: { countOf: ARTIFACTS },
            then: { kind: "sacrifice-target", target: 0 },
            prompt: "Sacrifice any number of artifacts",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              value: { thisWay: "sacrificed" },
              targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
                  { kind: "draw", amount: { triggerValue: true } },
                ],
              },
              text: "When you sacrifice one or more artifacts this way, tap up to that many target creatures and draw that many cards.",
            },
          },
        ],
      },
      resolve: null,
      text: BOOSTER_TEXT,
    },
  ],
});
