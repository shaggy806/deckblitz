import { defineCard } from "../define.js";

// EDHREC rank 18140.
//
// The free cast is offered beside the normal one while you've cast a white
// spell this turn; the check runs before this spell is cast, so the spell
// counted is always "another" one.

export default defineCard({
  name: "Patrician's Scorn",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "If you've cast another white spell this turn, you may cast this spell without paying its mana cost.\nDestroy all enchantments.",
  freeCastIf: { condition: { kind: "cast-this-turn", who: "you", filter: { colors: ["W"] }, atLeast: 1 } },
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
