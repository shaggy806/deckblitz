import { defineCard } from "../define.js";

// EDHREC rank 5360.
// Rulings:
//   To determine the total cost of a spell, start with the mana cost or
//   alternative cost you're paying, add any cost increases, then apply any
//   cost reductions. Finally, apply Trinisphere's effect if the mana component
//   of the spell's cost is less than three mana (rule 601.2f — `minimumMana`).
//   The spell's mana value is unchanged.
//   If Trinisphere leaves the battlefield or becomes tapped or untapped as a
//   cost to cast a spell, that cost is paid after the total cost is locked in.

const TEXT =
  "As long as this artifact is untapped, each spell that would cost less than three mana to cast costs three mana to cast.";

export default defineCard({
  name: "Trinisphere",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${TEXT} (Additional mana in the cost may be paid with any color of mana or colorless mana. For example, a spell that would cost {1}{B} to cast costs {2}{B} to cast instead.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { tapped: false } },
      costModification: { applies: {}, minimumMana: 3 },
      text: TEXT,
    },
  ],
});
