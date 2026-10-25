import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32252.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// "Other creatures you control of a type you noted" — no type was noted, so the static
// applies to nothing.
export default defineCard({
  name: "Paliano Vanguard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Draft this card face up.\nAs you draft a creature card, you may reveal it, note its creature types, then turn this card face down.\nOther creatures you control of a type you noted for cards named Paliano Vanguard get +1/+1.",
});
