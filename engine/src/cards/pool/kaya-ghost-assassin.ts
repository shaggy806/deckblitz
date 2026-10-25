import { defineCard } from "../define.js";

// Rulings: whether to target a creature is chosen on activation; with a
// target, Kaya or that creature is chosen as the ability resolves (and an
// illegal target means nothing happens — the ability doesn't resolve). With
// no target, Kaya is exiled if she's still there, and you lose 2 life
// either way.

const ZERO_TEXT =
  "0: Exile Kaya or up to one target creature. Return that card to the battlefield under its owner's control at the beginning of your next upkeep. You lose 2 life.";
const RETURN_TEXT = "Return the exiled card to the battlefield under its owner's control.";

export default defineCard({
  name: "Kaya, Ghost Assassin",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Kaya"],
  loyalty: 5,
  text: "0: Exile Kaya or up to one target creature. Return that card to the battlefield under its owner's control at the beginning of your next upkeep. You lose 2 life.\n−1: Each opponent loses 2 life and you gain 2 life.\n−2: Each opponent discards a card and you draw a card.",
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: { kind: "target-chosen", index: 0 },
            then: {
              kind: "modal",
              minModes: 1,
              maxModes: 1,
              modes: [
                {
                  text: "Exile Kaya.",
                  effect: { kind: "flicker", target: "source", returnAt: "your-next-upkeep", returnText: RETURN_TEXT },
                },
                {
                  text: "Exile the target creature.",
                  effect: { kind: "flicker", target: 0, returnAt: "your-next-upkeep", returnText: RETURN_TEXT },
                },
              ],
            },
            else: { kind: "flicker", target: "source", returnAt: "your-next-upkeep", returnText: RETURN_TEXT },
          },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, who: "each-opponent" },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: "−1: Each opponent loses 2 life and you gain 2 life.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "−2: Each opponent discards a card and you draw a card.",
    },
  ],
});
