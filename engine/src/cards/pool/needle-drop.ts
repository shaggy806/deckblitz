import { defineCard } from "../define.js";

// EDHREC rank 6772. "Any target that was dealt damage this turn" is a creature,
// planeswalker or battle with damage on its record this turn, or a player the
// turn's damage total says was dealt some (`playerWith`) — combat or not, from
// any source. The draw doesn't depend on the damage, only on the target still
// being legal as it resolves (rule 608.2b).

export default defineCard({
  name: "Needle Drop",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Needle Drop deals 1 damage to any target that was dealt damage this turn.\nDraw a card.",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["creature", "planeswalker", "battle"], damagedThisTurnBy: {} },
      orPlayer: "any",
      playerWith: { turnStat: "damage-taken" },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 1, target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
