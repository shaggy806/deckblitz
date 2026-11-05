import { defineCard } from "../define.js";

const SKIP = "If an opponent would begin an extra turn, that player skips that turn instead.";
const DRAW =
  "Whenever an opponent attacks you with two or more creatures, draws their second card each turn, or casts their second spell each turn, you draw a card.";

// One ability with three trigger events (`sameAbilityAs`): each fires on its
// own, so an opponent doing all three in a turn gives three cards (the rulings).
export default defineCard({
  name: "Trouble in Pairs",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${SKIP}\n${DRAW}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-begin-turn", who: "opponent", extraOnly: true },
      text: SKIP,
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "opponent", atLeast: 2, attackingYouDirectly: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
    {
      trigger: { on: "draws", who: "opponent", nthEachTurn: 2 },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
    {
      trigger: { on: "cast-spell", who: "opponent", nthEachTurn: 2 },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW,
    },
  ],
});
