import { defineCard } from "../define.js";

// EDHREC rank 10507.
//
// Rulings:
//   The cards cast this way go to their owner's graveyard after they resolve (rule 108.3).
//   They're cast as this resolves, ignoring timing restrictions based on card type (rule
//     608.2g); X must be 0 (rule 107.3b), and mandatory additional costs are paid.
//   Spell mastery is checked as this resolves; this spell itself, on the stack, isn't counted.
//   With nothing castable, or nothing cast, the revealed cards all go to that player's
//     graveyard.
//   With spell mastery, the two are cast one after the other: the last cast resolves first.
const MAIN_TEXT =
  "Target opponent reveals the top seven cards of their library. You may cast an instant or sorcery spell from among them without paying its mana cost. Then that player puts the rest into their graveyard.";
const MASTERY_TEXT =
  "Spell mastery — If there are two or more instant and/or sorcery cards in your graveyard, you may cast up to two instant and/or sorcery spells from among the revealed cards instead of one.";

export default defineCard({
  name: "Talent of the Telepath",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: `${MAIN_TEXT}\n${MASTERY_TEXT}`,
  targets: ["opponent"],
  effect: {
    kind: "conditional",
    condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { typesAnyOf: ["instant", "sorcery"] } },
    then: {
      kind: "cast-now",
      from: { libraryTop: 7, reveal: true, of: { target: 0 } },
      spell: { typesAnyOf: ["instant", "sorcery"] },
      free: true,
      repeat: true,
      upTo: 2,
      rest: "graveyard",
    },
    else: {
      kind: "cast-now",
      from: { libraryTop: 7, reveal: true, of: { target: 0 } },
      spell: { typesAnyOf: ["instant", "sorcery"] },
      free: true,
      rest: "graveyard",
    },
  },
});
