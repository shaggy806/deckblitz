import { defineCard } from "../define.js";

// EDHREC rank 3252.
//
// The creatures untap as the new combat begins, not as this resolves, and only
// those that attacked by then (the rulings). A second one in the same turn puts
// its combat and main phase ahead of the first's (the rulings; rule 500.8);
// resolving after the second main phase, it adds nothing, though rebound still
// works (the rulings). "At the beginning of that combat" is a delayed ability
// on that one phase (rule 603.7).

const TEXT =
  "After the second main phase this turn, there's an additional combat phase followed by an additional main phase. At the beginning of that combat, untap all creatures that attacked this turn.";

export default defineCard({
  name: "World at War",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${TEXT}\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)`,
  rebound: true,
  effect: {
    kind: "additional-combat",
    afterSecondMain: true,
    atBeginning: {
      effect: { kind: "untap-all", filter: { type: "creature", attackedThisTurn: true } },
      text: "At the beginning of that combat, untap all creatures that attacked this turn.",
    },
  },
});
