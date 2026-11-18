import { defineCard } from "../define.js";

// Rulings:
//   Hallowed Moonlight won't affect any creature that was cast, no matter which zone it was cast
//     from and whether or not its mana cost was paid.
//   After Hallowed Moonlight resolves, if a creature token would be put onto the battlefield, it's
//     put into exile instead and then ceases to exist. Creature tokens are never cast, even if the
//     spell that created them was.

// A resolved replacement for the turn (rules 611.2c, 614.6), Mistcaller's
// without "nontoken": a creature token is exiled as it's minted
// (`Game.mintFreshTokenObject`), never created (701.7a), and ceases to exist
// (111.7).
const TEXT = "Until end of turn, if a creature would enter and it wasn't cast, exile it instead.";

export default defineCard({
  name: "Hallowed Moonlight",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${TEXT}\nDraw a card.`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "others-enter-battlefield", filter: { type: "creature", cast: false }, exileInstead: true },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
