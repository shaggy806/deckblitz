import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32226.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
export default defineCard({
  name: "Leovold's Operative",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 3,
  toughness: 2,
  text: "Draft this card face up.\nAs you draft a card, you may draft an additional card from that booster pack. If you do, turn this card face down, then pass the next booster pack without drafting a card from it. (You may look at that booster pack.)",
});
