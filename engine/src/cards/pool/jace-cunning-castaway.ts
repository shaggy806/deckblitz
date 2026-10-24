import { defineCard } from "../define.js";

// EDHREC rank 11447.
// Makes Illusion → "Illusion Token (Sacrificed When Targeted)".
// The +1 is a delayed triggered ability for the rest of the turn (rule
// 603.7c) on the batched combat-damage event: once per player dealt combat
// damage, and again in a second combat-damage step (the ruling). The −5's
// tokens copy only what's printed on Jace (rule 707.2), not legendary, each
// entering with three loyalty (the rulings).
const PLUS_TEXT =
  "+1: Whenever one or more creatures you control deal combat damage to a player this turn, draw a card, then discard a card.";
const ILLUSION_TEXT =
  '−2: Create a 2/2 blue Illusion creature token with "When this token becomes the target of a spell, sacrifice it."';
const COPY_TEXT = "−5: Create two tokens that are copies of Jace, except they're not legendary.";

export default defineCard({
  name: "Jace, Cunning Castaway",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${ILLUSION_TEXT}\n${COPY_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
        },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "discard", target: "you", amount: 1 },
          ],
        },
        text: "Whenever one or more creatures you control deal combat damage to a player this turn, draw a card, then discard a card.",
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Illusion Token (Sacrificed When Targeted)", count: 1 },
      resolve: null,
      text: ILLUSION_TEXT,
    },
    {
      loyaltyCost: -5,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 2, who: "you", notLegendary: true },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
