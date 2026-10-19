import { defineCard } from "../define.js";

const BURN = { kind: "damage", amount: { cardsInHand: "you" }, target: 0 } as const;

// Ruling (2022-09-09): it draws only if kicked, but deals the damage either
// way — counted after the draw.
export default defineCard({
  name: "Fires of Victory",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Kicker {2}{U} (You may pay an additional {2}{U} as you cast this spell.)\n" +
    "If this spell was kicked, draw a card. Fires of Victory deals damage to target creature or planeswalker equal to the number of cards in your hand.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: BURN,
  kicker: {
    cost: "{2}{U}",
    effect: { kind: "sequence", effects: [{ kind: "draw", amount: 1 }, BURN] },
  },
});
