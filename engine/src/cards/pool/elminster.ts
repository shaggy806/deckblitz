import { defineCard } from "../define.js";

// The scry trigger's value is the number of cards looked at; the reduction
// is fixed as it resolves and used up by the next instant or sorcery spell
// you cast this turn.

const SCRY_TEXT =
  "Whenever you scry, the next instant or sorcery spell you cast this turn costs {X} less to cast, where X is the number of cards looked at while scrying this way.";
const PLUS_TEXT = "+2: Draw a card, then scry 2.";
const MINUS_TEXT =
  "−3: Exile the top card of your library. Create a number of 1/1 blue Faerie Dragon creature tokens with flying equal to that card's mana value.";

export default defineCard({
  name: "Elminster",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Elminster"],
  loyalty: 5,
  canBeCommander: true,
  text: `${SCRY_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}\nElminster can be your commander.`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "scry", amount: 2 },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          { kind: "create-token", token: "Faerie Dragon Token", count: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "exiled" } } },
        ],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        reduceGeneric: { triggerValue: true },
      },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
