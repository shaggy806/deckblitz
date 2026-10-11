import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 18468.
//
// −2's "if you sacrificed a creature this way" is Deadly Brew's shape: the
// edict's own sacrifices, read back by player. −3 asks each opponent in turn
// (`for-each-player`) whether they discarded fewer than two nonland cards this
// way — a player with an empty hand, one who discarded a land, or one who had
// only one card all count — and you draw once for each.

const EXILE_TEXT = "If a creature an opponent controls would die, exile it instead.";
const PLUS_TEXT = "+2: Up to one target creature gets -4/-1 until your next turn.";
const MINUS_TWO_TEXT =
  "−2: Each player sacrifices a creature of their choice. If you sacrificed a creature this way, create a 4/4 green Beast creature token with trample.";
const MINUS_THREE_TEXT =
  "−3: Each opponent discards two cards. For each opponent who didn't discard two nonland cards this way, you draw a card.";

export default defineCard({
  name: "Garruk, Veiled Butcher",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Garruk"],
  loyalty: 5,
  text: `${EXILE_TEXT}\n${PLUS_TEXT}\n${MINUS_TWO_TEXT}\n${MINUS_THREE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent" },
      },
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: -1, duration: "until-your-next-turn" },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "each-player", filter: { type: "creature" }, count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "sacrificed", who: "you" },
            then: { kind: "create-token", token: "Beast Token (Garruk, Veiled Butcher)", count: 1 },
          },
        ],
      },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 2 },
          {
            kind: "for-each-player",
            who: "each-opponent",
            effect: {
              kind: "conditional",
              condition: {
                kind: "this-way",
                what: "discarded",
                who: "that-player",
                filter: { notTypes: ["land"] },
                atMost: 1,
              },
              then: { kind: "draw", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: MINUS_THREE_TEXT,
    },
  ],
});
