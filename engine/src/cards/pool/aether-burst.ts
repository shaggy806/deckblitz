import { defineCard } from "../define.js";

// EDHREC rank 29492.
//
// The count is read as it's cast (the wording), this card on the stack and so
// not among those in graveyards.

export default defineCard({
  name: "Aether Burst",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return up to X target creatures to their owners' hands, where X is one plus the number of cards named Aether Burst in all graveyards as you cast this spell.",
  targets: [
    {
      kind: "any-number",
      of: "creature",
      max: { sum: [{ countInGraveyard: { name: "Aether Burst" } }, 1] },
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "return-to-hand", target: 0 },
  },
});
