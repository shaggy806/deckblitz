import { defineCard } from "../define.js";

// EDHREC rank 23080.
//
// The reflexive trigger exists only when at least one nonland card was
// discarded, and carries how many as the bound of its group.

const ENTER_TEXT =
  "When this creature enters, draw two cards, then discard two cards. When you discard one or more nonland cards this way, tap up to that many target creatures and put a stun counter on each of them.";
const GRAVEYARD_TEXT = "{3}{U}{U}, Exile this card from your graveyard: Draw two cards.";

export default defineCard({
  name: "Seasoned Cryomancer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${GRAVEYARD_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: GRAVEYARD_TEXT,
      zone: "graveyard",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "discard", target: "you", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
            then: {
              kind: "reflexive-trigger",
              targets: [{ kind: "any-number", of: "creature", max: { triggerValue: true } }],
              value: { thisWay: "discarded", filter: { notTypes: ["land"] } },
              effect: {
                kind: "for-each-target",
                from: 0,
                effect: {
                  kind: "sequence",
                  effects: [
                    { kind: "tap", target: 0 },
                    { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
                  ],
                },
              },
              text: "When you discard one or more nonland cards this way, tap up to that many target creatures and put a stun counter on each of them.",
            },
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
