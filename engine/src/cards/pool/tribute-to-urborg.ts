import { defineCard } from "../define.js";

// EDHREC rank 26884.
//
// Rulings:
//   [2022-09-09] Tribute to Urborg is not in your graveyard yet as it is resolving, so it doesn't
//     count itself.
//
// The additional -1/-1 per card is Desert's Due's shape: a second
// `modify-pt` whose amount is the count times -1, read as it resolves.

const SHRINK = { kind: "modify-pt", target: 0, power: -2, toughness: -2, duration: "end-of-turn" } as const;
const PER_CARD = {
  product: [{ countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } }, -1],
} as const;

export default defineCard({
  name: "Tribute to Urborg",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nTarget creature gets -2/-2 until end of turn. If this spell was kicked, that creature gets an additional -1/-1 until end of turn for each instant and sorcery card in your graveyard.",
  targets: ["creature"],
  effect: SHRINK,
  kicker: {
    cost: "{1}{U}",
    effect: {
      kind: "sequence",
      effects: [
        SHRINK,
        { kind: "modify-pt", target: 0, power: PER_CARD, toughness: PER_CARD, duration: "end-of-turn" },
      ],
    },
  },
});
