import { defineCard } from "../define.js";

// EDHREC rank 16865. "A creature you don't control" is one an
// opponent controls (no teams). An untapped creature may be targeted (the
// ruling); the requirement is `block-if-able` with no attacker named.

export default defineCard({
  name: "Provoke",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Untap target creature you don't control. That creature blocks this turn if able.\nDraw a card.",
  targets: ["creature-an-opponent-controls"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "block-if-able", target: 0 },
      { kind: "draw", amount: 1 },
    ],
  },
});
