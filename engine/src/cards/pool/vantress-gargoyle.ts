import { defineCard } from "../define.js";

const ATTACK = "This creature can't attack unless defending player has seven or more cards in their graveyard.";
const BLOCK = "This creature can't block unless you have four or more cards in hand.";
const MILL = "{T}: Each player mills a card.";

export default defineCard({
  name: "Vantress Gargoyle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ATTACK}\n${BLOCK}\n${MILL}`,
  static: [
    { affects: { scope: "self" }, cantAttackUnlessDefender: { holds: { kind: "cards-in-graveyard", atLeast: 7 } }, text: ATTACK },
    { affects: { scope: "self" }, condition: { kind: "hand-size", atMost: 3 }, restrictions: ["cant-block"], text: BLOCK },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 1 },
      resolve: null,
      text: MILL,
    },
  ],
});
