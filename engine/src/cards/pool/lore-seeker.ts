import { defineCard } from "../define.js";

// Conspiracy. EDHREC rank 32137.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so
// it is a 2/2 artifact creature in play.

export default defineCard({
  name: "Lore Seeker",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: "Reveal this card as you draft it. After you draft this card, you may add a booster pack to the draft. (Your next pick is from that booster pack. Pass it to the next player and it's drafted this draft round.)",
});
