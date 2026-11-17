import { defineCard } from "../define.js";

// The Dark (DRK). EDHREC rank 11702.
//
// The chosen-source shield (rule 609.7) with `half: "down"`: the next damage
// event from that source to you has half of it prevented, rounded down. One
// that would prevent none of it (1 damage) isn't used up (609.7b).
//
// Rulings:
//   - If two or more of these effects would apply, you apply them sequentially. So if the source
//     would deal 5 damage after two of these abilities have resolved, the first one prevents 2
//     damage, reducing it to 3 damage, then the second one prevents a further 1 damage, reducing
//     the total damage dealt to 2.

const TEXT =
  "{T}, Sacrifice this artifact: The next time a source of your choice would deal damage to you this turn, prevent half that damage, rounded down.";

export default defineCard({
  name: "Dark Sphere",
  manaCost: "{0}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "you", amount: "next-time", half: "down" },
      resolve: null,
      text: TEXT,
    },
  ],
});
