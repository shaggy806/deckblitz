import { defineCard } from "../define.js";

const PLUS_TWO =
  "+2: Target opponent exiles cards from the top of their library until they exile a nonland card. Until end of turn, you may cast that card without paying its mana cost.";
const PLUS_ONE = "+1: Each opponent exiles two cards from their hand.";
const MINUS_FOUR = "−4: Nicol Bolas deals 7 damage to target opponent, creature an opponent controls, or planeswalker an opponent controls.";
const MINUS_TWELVE = "−12: Exile each nonland permanent your opponents control.";

export default defineCard({
  name: "Nicol Bolas, God-Pharaoh",
  manaCost: "{4}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Bolas"],
  loyalty: 7,
  text: `${PLUS_TWO}\n${PLUS_ONE}\n${MINUS_FOUR}\n${MINUS_TWELVE}`,
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "reveal-until",
        whose: 0,
        filter: { notTypes: ["land"] },
        exile: true,
        then: { kind: "allow-cast-from-exile", target: 0, free: true },
        rest: "stay",
      },
      resolve: null,
      text: PLUS_TWO,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 2,
          max: 2,
          destination: "exile",
          unlinked: true,
          leftover: "stay",
        },
      },
      resolve: null,
      text: PLUS_ONE,
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "permanent",
          whose: "opponent",
          filter: { typesAnyOf: ["creature", "planeswalker"] },
          orPlayer: "opponent",
        },
      ],
      effect: { kind: "damage", amount: 7, target: 0 },
      resolve: null,
      text: MINUS_FOUR,
    },
    {
      loyaltyCost: -12,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "exile-all", filter: { notTypes: ["land"], controlledBy: "opponent" } },
      resolve: null,
      text: MINUS_TWELVE,
    },
  ],
});
