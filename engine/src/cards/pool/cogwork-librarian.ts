import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 31406.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so
// it is a 3/3 artifact creature in play.

export default defineCard({
  name: "Cogwork Librarian",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  text: "Draft this card face up.\nAs you draft a card, you may draft an additional card from that booster pack. If you do, put this card into that booster pack.",
});
