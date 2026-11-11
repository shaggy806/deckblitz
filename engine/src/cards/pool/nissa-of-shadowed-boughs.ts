import { defineCard } from "../define.js";

// EDHREC rank 5867.
//
// Rulings:
//   [2020-09-25] Nissa's middle ability can target a land that's already untapped or that's
//     already a creature.
//   [2020-09-25] Nissa's middle ability doesn't remove any abilities the land creature has.
//   [2020-09-25] The creature card's mana value is checked only in your hand or graveyard.
//
// The −5 is one choice over the hand and the graveyard together (Kastral,
// the Windcrested's `from`).
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, put a loyalty counter on Nissa.";
const PLUS_TEXT =
  "+1: Untap target land you control. You may have it become a 3/3 Elemental creature with haste and menace until end of turn. It's still a land.";
const MINUS_TEXT =
  "−5: You may put a creature card with mana value less than or equal to the number of lands you control onto the battlefield from your hand or graveyard with two +1/+1 counters on it.";

export default defineCard({
  name: "Nissa of Shadowed Boughs",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nissa"],
  loyalty: 4,
  text: `${LANDFALL_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: ["land-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "may",
            prompt: "Have the target land become a 3/3 Elemental creature with haste and menace until end of turn?",
            effect: {
              kind: "become",
              target: 0,
              power: 3,
              toughness: 3,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              keywords: ["haste", "menace"],
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a creature card from your hand or graveyard onto the battlefield with two +1/+1 counters on it?",
        effect: {
          kind: "return-from-graveyard",
          filter: {
            type: "creature",
            manaValue: { op: "lte", n: { amount: { countOf: { type: "land", controlledBy: "you" } } } },
          },
          destination: "battlefield",
          count: 1,
          withCounters: { kind: "+1/+1", amount: 2 },
          from: "hand-or-graveyard",
        },
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
