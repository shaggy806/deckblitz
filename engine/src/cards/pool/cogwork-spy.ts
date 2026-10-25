import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 31510.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// revealed or looked at for it. In a game it is a 2/1 flier.
export default defineCard({
  name: "Cogwork Spy",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Bird", "Construct"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Reveal this card as you draft it. You may look at the next card drafted from this booster pack.\nFlying",
});
