import { defineCard } from "../define.js";

// EDHREC rank 26165.
//
// Rulings: it doesn't matter who cast the first spell; no alternative costs,
// though additional costs may be paid; one card, cast as the ability resolves
// (rule 608.2g), not a lasting permission. "The same name as a spell that was
// cast this turn" is any player's spell, named as it was on the stack
// (`sameNameAsSpellCastThisTurn`).

const TEXT =
  "{1}, {T}: You may cast a spell from your hand without paying its mana cost if it has the same name as a spell that was cast this turn.";

export default defineCard({
  name: "Twinning Glass",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "cast-now", from: "hand", free: true, spell: { sameNameAsSpellCastThisTurn: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
