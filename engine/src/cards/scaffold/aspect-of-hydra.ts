import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 11628.
//
// Rulings:
//   [2013-09-15] If an activated ability or triggered ability has an effect that depends on your
//     devotion to a color, you count the number of mana symbols of that color among the mana costs
//     of permanents you control as the ability resolves. The permanent with that ability will be
//     counted if it’s still on the battlefield at that time.
//   [2013-09-15] Numeric mana symbols ({0}, {1}, and so on) in mana costs of permanents you
//     control don’t count toward your devotion to any color.
//   [2013-09-15] Mana symbols in the text boxes of permanents you control don’t count toward your
//     devotion to any color.
//   [2013-09-15] Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols
//     do count toward your devotion to their color(s).
//   [2014-02-01] The value of X is calculated as Aspect of Hydra resolves. The bonus won’t change
//     later in the turn, even if your devotion to green does.

export default defineCard({
  name: "Aspect of Hydra",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +X/+X until end of turn, where X is your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  // TODO(scaffold): Target creature gets +X/+X until end of turn, where X is your devotion to green.
});
