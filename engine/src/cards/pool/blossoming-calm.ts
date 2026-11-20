import { defineCard } from "../define.js";

// "You gain hexproof until your next turn" is a timed static of the caster's
// (`playerKeywords`, rule 702.11d), lasting until their next turn begins — as
// Gilded Light's shroud lasts the turn. Rebound (rule 702.88) casts it again
// at the next upkeep, granting it afresh.

export default defineCard({
  name: "Blossoming Calm",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  rebound: true,
  text: "You gain hexproof until your next turn. You gain 2 life.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "timed-static",
        duration: "until-your-next-turn",
        text: "You have hexproof until your next turn.",
        static: [{ affects: { scope: "self" }, playerKeywords: ["hexproof"], text: "You have hexproof." }],
      },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
