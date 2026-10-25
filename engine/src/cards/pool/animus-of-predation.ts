import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32164.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
export default defineCard({
  name: "Animus of Predation",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 4,
  toughness: 4,
  text: "Draft this card face up.\nAs you draft a card, you may remove it from the draft face up. (It isn't in your card pool.)\nIf you removed a creature card with flying from the draft with cards named Animus of Predation, this creature has flying. The same is true for first strike, double strike, deathtouch, haste, hexproof, indestructible, lifelink, menace, reach, and vigilance.",
});
