import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 30765.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
export default defineCard({
  name: "Archdemon of Paliano",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: "Draft this card face up.\nAs long as this card is face up during the draft, you can't look at booster packs and must draft cards at random. After you draft three cards this way, turn this card face down. (You may look at cards as you draft them.)\nFlying",
});
