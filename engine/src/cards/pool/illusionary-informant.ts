import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32059.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
export default defineCard({
  name: "Illusionary Informant",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Illusion"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Draft this card face up.\nDuring the draft, you may turn this card face down. If you do, look at the next card drafted by a player of your choice.\nFlying",
});
