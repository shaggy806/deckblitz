import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 15535.
//
// "Reveal X white cards from your hand" is the activated cost `reveal`
// (rule 701.20a): X announced as it's activated, at most the white cards
// there are, and which ones chosen as the cost is paid (601.2h). They stay
// in hand; X stands whatever happens to them after (the ruling).

const TEXT = "{1}, Reveal X white cards from your hand, Sacrifice this creature: You gain three times X life.";

export default defineCard({
  name: "Martyr of Sands",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self", reveal: { count: "x", filter: { colors: ["W"] }, text: "white cards" } },
      targets: [],
      effect: { kind: "gain-life", amount: { product: [3, "x"] } },
      resolve: null,
      text: TEXT,
    },
  ],
});
