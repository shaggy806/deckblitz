import { defineCard } from "../define.js";
import { annihilator } from "../helpers.js";

// Rise of the Eldrazi. top-5000 #1118, EDHREC rank 1110.
//
// Rulings:
//   Kozilek's first ability triggers as you cast it, and that ability resolves
//   before the spell itself. It resolves even if the spell is countered.
//
// The shuffle works from the graveyard (`fromGraveyard`, Worldspine Wurm's
// shape), where the card's controller is its owner — so "you" is "its owner".

const CAST_TEXT = "When you cast this spell, draw four cards.";
const SHUFFLE_TEXT =
  "When Kozilek is put into a graveyard from anywhere, its owner shuffles their graveyard into their library.";

export default defineCard({
  name: "Kozilek, Butcher of Truth",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 12,
  toughness: 12,
  text: `${CAST_TEXT}\nAnnihilator 4 (Whenever this creature attacks, defending player sacrifices four permanents of their choice.)\n${SHUFFLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "draw", amount: 4 },
      resolve: null,
      text: CAST_TEXT,
    },
    annihilator(4),
    {
      trigger: { on: "put-into-graveyard", who: "self" },
      fromGraveyard: true,
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: SHUFFLE_TEXT,
    },
  ],
});
