import { defineCard } from "../define.js";

const TEXT = "Target opponent may have Risk Factor deal 4 damage to them. If that player doesn't, you draw three cards.";

// The punisher choice is the targeted opponent's (Combustible Gearhulk's
// shape); the draw is the caster's.
export default defineCard({
  name: "Risk Factor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  flashback: { cost: "{2}{R}", discard: 1, keyword: "jump-start" },
  text: `${TEXT}\nJump-start (You may cast this card from your graveyard by discarding a card in addition to paying its other costs. Then exile this card.)`,
  targets: ["opponent"],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    choices: [
      { text: "Have Risk Factor deal 4 damage to you.", effect: { kind: "damage", target: 0, amount: 4 } },
      { text: "Let them draw three cards.", effect: { kind: "draw", amount: 3 } },
    ],
  },
});
