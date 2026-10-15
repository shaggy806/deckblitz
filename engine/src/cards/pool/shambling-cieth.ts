import { defineCard } from "../define.js";

// EDHREC rank 17444.
//
// Spit Flame's shape: an ability that returns its own card from the graveyard
// works only there (rule 113.6k — `fromGraveyard`), paid for with a `may`
// cost as it resolves.
//
// Rulings:
//   [2025-06-06] Shambling Cie'th's ability resolves before the spell that caused it to trigger.
//     It resolves even if that spell is countered or otherwise leaves the stack.

const RETURN_TEXT =
  "Whenever you cast a noncreature spell, you may pay {B}. If you do, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Shambling Cie'th",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Mutant", "Horror"],
  power: 3,
  toughness: 3,
  text: `This creature enters tapped.\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Shambling Cie'th to your hand?",
        cost: "{B}",
        effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
