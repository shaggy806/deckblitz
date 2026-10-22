import { defineCard } from "../define.js";

// EDHREC rank 12843. Hour of Devastation. The first ability exiles the target
// even if the Angel has left by then, and it still comes back (the ruling);
// the second needs the Angel still there, and returns the card the moment it
// leaves (rule 610.3c). Exert is part of the second's cost (rule 701.43).
const FLICKER_TEXT =
  "{2}{W}, {T}: Exile another target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.";
const EXILE_TEXT =
  "{2}{W}, {T}, Exert this creature: Exile another target creature until this creature leaves the battlefield.";

export default defineCard({
  name: "Angel of Condemnation",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${FLICKER_TEXT}\n${EXILE_TEXT} (An exerted creature won't untap during your next untap step.)`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: FLICKER_TEXT,
    },
    {
      cost: { mana: "{2}{W}", tap: true, exertSelf: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
