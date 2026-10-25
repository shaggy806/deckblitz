import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32273.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Its ruling: with no Noble Banneret drafted, no names were noted, so it gets nothing.
export default defineCard({
  name: "Noble Banneret",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: "Draft this card face up.\nAs you draft a creature card, you may reveal it, note its name, then turn this card face down.\nAs long as you control one or more creatures with a name you noted for cards named Noble Banneret, this creature and those creatures get +1/+1 and have lifelink.",
});
