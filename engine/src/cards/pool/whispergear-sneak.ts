import { defineCard } from "../define.js";

// Conspiracy (CNS). EDHREC rank 30797.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
export default defineCard({
  name: "Whispergear Sneak",
  manaCost: "{1}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 1,
  toughness: 1,
  text: "Draft this card face up.\nDuring the draft, you may turn this card face down. If you do, look at any unopened booster pack in the draft or any booster pack not being looked at by another player.",
});
