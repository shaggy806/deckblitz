import { defineCard } from "../define.js";

// EDHREC rank 25286.
//
// Rulings:
//   [2013-04-15] No monocolored creature will be able to block that turn, including monocolored
//     creatures that enter the battlefield after Awe for the Guilds resolves. A creature that's
//     monocolored when Awe for the Guilds resolves but somehow becomes multicolored before
//     blockers are declared will be able to block.
//   [2013-04-15] A monocolored creature is exactly one color. (Colorless creatures aren't
//     monocolored.)
//
// `restrict` over a filter is a turn-wide rule read at each check (rule 611.2c), so a creature
// entering later, or changing colours, is judged as it is then — both rulings. Monocolored is
// "not multicolored and not colorless".

export default defineCard({
  name: "Awe for the Guilds",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Monocolored creatures can't block this turn.",
  targets: [],
  effect: {
    kind: "restrict",
    filter: { type: "creature", multicolored: false, colorless: false },
    restrictions: ["cant-block"],
  },
});
