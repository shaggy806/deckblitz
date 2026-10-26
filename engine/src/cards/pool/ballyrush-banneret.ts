import { defineCard } from "../define.js";

// EDHREC rank 8864. Morningtide.
//
// Rulings:
//   [2024-11-08] Spells you cast that have both types cost {1} less to cast, not {2} less.
//   [2024-11-08] Ballyrush Banneret's ability doesn't change the mana cost or mana value of any
//     spell. It changes only the total cost you pay to cast Kithkin and Soldier spells.
//   [2024-11-08] Ballyrush Banneret's ability can't reduce the amount of colored mana you pay for
//     a spell. It reduces only the generic mana component of that spell.
//
// One reduction over either type (`anyOf`), so a Kithkin Soldier spell gets {1}
// off, not {2} (the first ruling).
const COST_TEXT = "Kithkin spells and Soldier spells you cast cost {1} less to cast.";

export default defineCard({
  name: "Ballyrush Banneret",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 1,
  text: COST_TEXT,
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { anyOf: [{ subtype: "Kithkin" }, { subtype: "Soldier" }] },
        caster: "you",
        reduceGeneric: 1,
      },
      text: COST_TEXT,
    },
  ],
});
