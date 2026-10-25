import { defineCard } from "../define.js";

// Conspiracy: Take the Crown (CN2). EDHREC rank 32232.
//
// Its draft abilities do nothing here: no game on this engine is drafted, so nothing was
// noted, revealed or exiled for it (the card's own rulings say how it plays then).
// Its ruling: with none drafted the highest noted number is 0 — it taps only a creature
// with power 0 or less.
export default defineCard({
  name: "Custodi Peacekeeper",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: "Reveal this card as you draft it and note how many cards you've drafted this draft round, including this card.\n{W}, {T}: Tap target creature with power less than or equal to the highest number you noted for cards named Custodi Peacekeeper.",
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", power: { op: "lte", n: 0 } } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{W}, {T}: Tap target creature with power less than or equal to the highest number you noted for cards named Custodi Peacekeeper.",
    },
  ],
});
