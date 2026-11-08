import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

// EDHREC rank 3845. A Class (Caretaker's Talent's shape): Captain Pike's look
// at the top card any time; at level 2, Augur of Autumn's play from the top of
// your library, every card, gated on having cast a spell this turn; at level
// 3, Advanced Reconstruction's not-from-hand reduction (generic only — the
// ruling).
//
// Rulings:
//   You must pay all costs and follow all timing rules for lands played and spells cast from the
//     top of your library this way.
//   The cost reduction applies only to generic mana in the total cost of spells you cast from
//     anywhere other than your hand.

const LOOK_TEXT = "You may look at the top card of your library any time.";
const PLAY_TEXT = "As long as you've cast a spell this turn, you may play cards from the top of your library.";
const REDUCE_TEXT = "Spells you cast from anywhere other than your hand cost {2} less to cast.";

export default defineCard({
  name: "Fortune Teller's Talent",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${LOOK_TEXT}\n{3}{U}: Level 2\n${PLAY_TEXT}\n{2}{U}: Level 3\n${REDUCE_TEXT}`,
  static: [
    { affects: { scope: "self" }, visibility: { looksAtOwnLibraryTop: true }, text: LOOK_TEXT },
    atLevel(2, {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn" },
      playFromLibraryTop: {},
      text: PLAY_TEXT,
    }),
    atLevel(3, {
      affects: { scope: "self" },
      costModification: { applies: {}, reduceGeneric: 2, when: { caster: "you", notFromCastersHand: true } },
      text: REDUCE_TEXT,
    }),
  ],
  activated: [classLevel(2, "{3}{U}"), classLevel(3, "{2}{U}")],
});
