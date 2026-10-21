import { defineCard } from "../define.js";

// EDHREC rank 17638.
//
// Addendum is asked as the spell resolves (the ruling), Return to Dust's
// shape: a spell cast in your main phase resolves in that phase, so "it was
// cast and it's now your main phase" is the same question. A copy wasn't
// cast, so it gives no flying (the ruling).
export default defineCard({
  name: "Arrester's Zeal",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 until end of turn.\nAddendum — If you cast this spell during your main phase, that creature gains flying until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source", filter: { cast: true } },
            { kind: "your-turn" },
            { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] },
          ],
        },
        then: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
    ],
  },
});
