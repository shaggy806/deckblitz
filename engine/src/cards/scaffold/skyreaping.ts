import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 24972.
//
// Rulings:
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don’t count toward your devotion to any color.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.

export default defineCard({
  name: "Skyreaping",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Skyreaping deals damage to each creature with flying equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  // TODO(scaffold): ~ deals damage to each creature with flying equal to your devotion to green.
});
