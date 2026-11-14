import { defineCard } from "../define.js";

// - Casualty X: X is announced as it's cast, with whether to pay (the ruling; rule 601.2b), and
//   the creature, of power X or greater, chosen as the cost is paid (601.2h). The copy — not cast,
//   so no cast trigger sees it — resolves first, isn't legendary and enters with X loyalty
//   (707.9b, 306.5b); it becomes a token as it resolves (707.10f). One creature, one copy.
// - The +1 asks each opponent in turn order whether to discard; the life is gained whatever they
//   chose, if you control a Demon or Devil as it resolves.

const CASUALTY =
  "Casualty X. The copy isn't legendary and has starting loyalty X. (As you cast this spell, you may sacrifice a creature with power X. When you do, copy this spell. The copy becomes a token.)";
const PLUS =
  "+1: Each opponent loses 2 life unless they discard a card. If you control a Demon or Devil, you gain 2 life.";
const DEVIL =
  "−2: Create a 1/1 red Devil creature token with \"When this token dies, it deals 1 damage to any target.\"";
const ULT = "−7: Target player draws seven cards and loses 7 life.";

export default defineCard({
  name: "Ob Nixilis, the Adversary",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nixilis"],
  loyalty: 3,
  text: `${CASUALTY}\n${PLUS}\n${DEVIL}\n${ULT}`,
  casualty: { n: "x", copyExcept: { removeSupertypes: ["legendary"] }, copyLoyaltyX: true },
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "each-player-may",
            who: "each-opponent",
            options: [{ discard: 1, text: "Discard a card" }],
            ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
          },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { subtypes: ["Demon", "Devil"] }, atLeast: 1 },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Devil Token", count: 1 },
      resolve: null,
      text: DEVIL,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 7, target: 0 },
          { kind: "lose-life", amount: 7, target: 0 },
        ],
      },
      resolve: null,
      text: ULT,
    },
  ],
});
