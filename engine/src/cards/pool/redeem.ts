import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 29180. "Up to two target creatures" is
// Dizzying Swoop's two optional slots; each gets Shielded Passage's shield.

export default defineCard({
  name: "Redeem",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage that would be dealt this turn to up to two target creatures.",
  targets: [
    { kind: "optional", of: "creature" },
    { kind: "optional", of: { kind: "other", of: "creature", than: { slot: 0 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "prevent-damage", target: 0, amount: "all" },
      { kind: "prevent-damage", target: 1, amount: "all" },
    ],
  },
});
