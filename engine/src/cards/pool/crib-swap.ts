import { defineCard } from "../define.js";

// Changeling on a kindred instant (rules 205.3m, 702.73a): every creature
// type as a spell and in every zone.

export default defineCard({
  name: "Crib Swap",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["kindred", "instant"],
  subtypes: ["Shapeshifter"],
  keywords: ["changeling"],
  text:
    "Changeling (This card is every creature type.)\n" +
    "Exile target creature. Its controller creates a 1/1 colorless Shapeshifter creature token with changeling.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      { kind: "create-token", token: "Shapeshifter Token", count: 1, who: "target-controller" },
    ],
  },
});
