import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 19688.
//
// The Emperor of Palamecia's "at least four mana was spent" cast trigger,
// making it an artifact creature until end of turn exactly as crewing does
// (Bespoke Battlewagon).
//
// Rulings:
//   [2025-06-06] The Prima Vista's second ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered or otherwise leaves the stack.

const CAST_TEXT =
  "Whenever you cast a noncreature spell, if at least four mana was spent to cast it, The Prima Vista becomes an artifact creature until end of turn.";

export default defineCard({
  name: "The Prima Vista",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${crewText(2)}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"], manaSpent: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [crew(2)],
});
