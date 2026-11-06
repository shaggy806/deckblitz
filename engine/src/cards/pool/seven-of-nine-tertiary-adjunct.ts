import { defineCard } from "../define.js";

// EDHREC rank 25018.

const REFLEXIVE_TEXT = "When you discard a nonland card this way, put two charge counters on up to one target artifact.";
const ABILITY_TEXT = `That Is Irrelevant — {T}: Draw a card, then discard a card. ${REFLEXIVE_TEXT}`;

export default defineCard({
  name: "Seven of Nine, Tertiary Adjunct",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 1,
  toughness: 4,
  text: ABILITY_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "optional", of: "artifact" }],
              effect: { kind: "add-counter", target: 0, counter: "charge", amount: 2 },
              text: REFLEXIVE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
