import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32250.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Its ruling: with none drafted the highest noted number is 0, so it deals no damage —
// but still targets.
export default defineCard({
  name: "Garbage Fire",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Reveal this card as you draft it and note how many cards you've drafted this draft round, including this card.\nGarbage Fire deals damage to target creature equal to the highest number you noted for cards named Garbage Fire.",
  targets: ["creature"],
  effect: { kind: "damage", amount: 0, target: 0 },
});
