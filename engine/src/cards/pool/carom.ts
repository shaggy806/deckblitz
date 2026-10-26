import { defineCard } from "../define.js";

// Rulings:
//   [2006-05-01] Carom's controller draws a card when Carom resolves, not when the damage is
//     redirected.
//   [2006-05-01] If either target has left the battlefield before the damage would be dealt, that
//     damage isn't redirected.

export default defineCard({
  name: "Carom",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "The next 1 damage that would be dealt to target creature this turn is dealt to another target creature instead.\nDraw a card.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage", target: 0, amount: 1, redirectTo: 1 },
      { kind: "draw", amount: 1 },
    ],
  },
});
