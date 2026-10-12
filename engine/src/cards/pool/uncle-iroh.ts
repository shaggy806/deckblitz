import { defineCard } from "../define.js";
import { firebending } from "../helpers.js";

// EDHREC rank 8484.
//
// Rulings:
//   [2025-10-02] Mana from firebending abilities isn't lost until you leave combat and go to your
//     second main phase. It can be used at any time during combat, even after combat damage has
//     been dealt.
//   [2025-10-02] Any other mana you add during combat will still be lost as normal when moving
//     between steps of combat.
//   [2025-10-02] Multiple instances of firebending on the same creature trigger separately, each
//     granting you the appropriate amount of mana.
//   [2025-10-02] "Firebending N" is a keyword that represents the ability "Whenever this creature
//     attacks, add N {R}. Until end of combat, you don't lose this mana as steps end."
//   [2025-10-02] To determine the total cost of a spell, start with the mana cost or alternative
//     cost you're paying, add any cost increases, then apply any cost reductions. The mana value
//     of the spell remains unchanged, no matter what the total cost to cast it was.
//   [2025-10-02] Firebending abilities aren't mana abilities. They use the stack and can be
//     responded to.

export default defineCard({
  name: "Uncle Iroh",
  manaCost: "{1}{R/G}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble", "Ally"],
  power: 4,
  toughness: 2,
  text: "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)\nLesson spells you cast cost {1} less to cast.",
  triggered: [
    firebending(1, "Firebending 1 (Whenever this creature attacks, add {R}. This mana lasts until end of combat.)"),
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Lesson" }, caster: "you", reduceGeneric: 1 },
      text: "Lesson spells you cast cost {1} less to cast.",
    },
  ],
});
