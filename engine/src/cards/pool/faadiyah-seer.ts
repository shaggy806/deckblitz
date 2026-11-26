import { defineCard } from "../define.js";

// EDHREC rank 21721.
//
// The card drawn is revealed (rule 701.20a), then discarded if it isn't a
// land: a `discard` held to the card drawn this way, so a draw replaced by
// something else (dredge) leaves nothing to discard.
const TEXT = "{T}: Draw a card and reveal it. If it isn't a land card, discard it.";

export default defineCard({
  name: "Fa'adiyah Seer",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "reveal-drawn" },
          { kind: "discard", target: "you", amount: 1, filter: { thisWay: "drawn", notTypes: ["land"] } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
