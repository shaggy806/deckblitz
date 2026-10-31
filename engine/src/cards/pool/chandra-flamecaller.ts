import { defineCard } from "../define.js";

// EDHREC rank 8842. Its 0 counts the cards discarded however they went (a
// madness card's discard into exile too — its ruling): `thisWay: "discarded"`.
// "−X" (rule 107.3a): `loyaltyCost: "-x"`, the damage `amount: "x"`.

export default defineCard({
  name: "Chandra, Flamecaller",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Chandra"],
  loyalty: 4,
  text: "+1: Create two 3/1 red Elemental creature tokens with haste. Exile them at the beginning of the next end step.\n0: Discard all the cards in your hand, then draw that many cards plus one.\n−X: Chandra deals X damage to each creature.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "3/1 Red Elemental Token (Haste)", count: 2, exileAtEndStep: true },
      resolve: null,
      text: "+1: Create two 3/1 red Elemental creature tokens with haste. Exile them at the beginning of the next end step.",
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { sum: [{ thisWay: "discarded" }, 1] } },
        ],
      },
      resolve: null,
      text: "0: Discard all the cards in your hand, then draw that many cards plus one.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "damage-all", amount: "x", filter: { type: "creature" } },
      resolve: null,
      text: "−X: Chandra deals X damage to each creature.",
    },
  ],
});
