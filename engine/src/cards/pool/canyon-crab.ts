import { defineCard } from "../define.js";

// EDHREC rank 14534.
//
// The intervening "if" (rule 603.4) is checked as the end step begins and
// again as the ability resolves (the ruling): a spell cast from your hand in
// between stops it. Spells cast from anywhere else don't count — each spell
// is read as it was cast (`spellsCastThisTurnAs`, `castFrom`).
const PUMP = "{1}{U}: This creature gets +2/-2 until end of turn.";
const LOOT =
  "At the beginning of your end step, if you haven't cast a spell from your hand this turn, draw a card, then discard a card.";

export default defineCard({
  name: "Canyon Crab",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Crab"],
  power: 0,
  toughness: 5,
  text: `${PUMP}\n${LOOT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "cast-this-turn", who: "you", filter: { castFrom: "hand" }, atLeast: 0, atMost: 0 },
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT,
    },
  ],
});
