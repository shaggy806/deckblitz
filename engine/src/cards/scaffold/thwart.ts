import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 15488.

export default defineCard({
  name: "Thwart",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may return three Islands you control to their owner's hand rather than pay this spell's mana cost.\nCounter target spell.",
  targets: ["spell"],
  // TODO(scaffold): You may return three Islands you control to their owner's hand rather than pay ~'s mana cost.
  // TODO(scaffold): (parsed "Counter target spell." as {"kind":"counter","target":0})
});
