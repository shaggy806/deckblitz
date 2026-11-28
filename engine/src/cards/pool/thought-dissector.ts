import { defineCard } from "../define.js";

// EDHREC rank 28424.
//
// A `reveal-until` that also stops at X cards revealed (`atMost: "x"`): the
// Xth card is still found if it's an artifact. The artifact found enters
// under your control, then this is sacrificed (`then`, applied only when one
// was found); the rest go to that player's graveyard, their owner's.
//
// Rulings:
//   You put the artifact card onto the battlefield even if Thought Dissector
//   has already left the battlefield and you can't sacrifice it.

export default defineCard({
  name: "Thought Dissector",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{X}, {T}: Target opponent reveals cards from the top of their library until an artifact card or X cards are revealed, whichever comes first. If an artifact card is revealed this way, put it onto the battlefield under your control and sacrifice this artifact. Put the rest of the revealed cards into that player's graveyard.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: ["opponent"],
      resolve: null,
      text: "{X}, {T}: Target opponent reveals cards from the top of their library until an artifact card or X cards are revealed, whichever comes first. If an artifact card is revealed this way, put it onto the battlefield under your control and sacrifice this artifact. Put the rest of the revealed cards into that player's graveyard.",
      effect: {
        kind: "reveal-until",
        whose: 0,
        filter: { type: "artifact" },
        atMost: "x",
        put: "battlefield",
        underYourControl: true,
        then: { kind: "sacrifice-source" },
        rest: "graveyard",
      },
    },
  ],
});
