import { defineCard } from "../define.js";

// EDHREC rank 6486.
//
// The bracketed loyalty symbols are effects, not costs (the ruling): put on or
// remove that many loyalty counters as the row resolves. Nothing is targeted
// ("All choices for cards, creatures, or players are made as the abilities
// resolve"): the 3's card is chosen from the graveyard as it resolves, and the
// 4-5's damage goes to a creature or player chosen then (the
// `choose-permanent-or-player` decision), its amount read before the −2. A 6
// lets his own printed ability be activated two more times this turn, each
// such 6 adding its own two (rule 606.3); a result past 6 or under 1 (Scooch)
// matches no row.
const ZERO =
  "0: Roll a six-sided die.\n1 or 2 — [+2], then create two 1/1 green Squirrel creature tokens. They gain haste until end of turn.\n3 — [−1], then return a card with mana value 2 or less from your graveyard to your hand.\n4 or 5 — Comet deals damage equal to the number of loyalty counters on him to a creature or player, then [−2].\n6 — [+1], and you may activate Comet's loyalty ability two more times this turn.";

export default defineCard({
  name: "Comet, Stellar Pup",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Comet"],
  loyalty: 5,
  text: ZERO,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 6,
        table: [
          {
            min: 1,
            max: 2,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: "source", counter: "loyalty", amount: 2 },
                { kind: "create-token", token: "Squirrel Token", count: 2, gainUntilEndOfTurn: ["haste"] },
              ],
            },
          },
          {
            min: 3,
            max: 3,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "remove-counter", target: "source", counter: "loyalty", amount: 1 },
                {
                  kind: "look-and-choose",
                  zone: "graveyard",
                  min: 1,
                  max: 1,
                  filter: { manaValue: { op: "lte", n: 2 } },
                  destination: "hand",
                  leftover: "stay",
                },
              ],
            },
          },
          {
            min: 4,
            max: 5,
            effect: {
              kind: "sequence",
              effects: [
                {
                  kind: "choose-permanents",
                  filter: { type: "creature" },
                  orPlayers: "each-player",
                  upTo: 1,
                  min: 1,
                  prompt: "Comet deals damage equal to his loyalty to a creature or player",
                  then: { kind: "damage", amount: { countersOn: "source", counter: "loyalty" }, target: 0 },
                },
                { kind: "remove-counter", target: "source", counter: "loyalty", amount: 2 },
              ],
            },
          },
          {
            min: 6,
            max: 6,
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: "source", counter: "loyalty", amount: 1 },
                { kind: "loyalty-activations", target: "source", times: { more: 2 }, duration: "end-of-turn" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: ZERO,
    },
  ],
});
