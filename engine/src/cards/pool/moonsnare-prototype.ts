import { defineCard } from "../define.js";

// EDHREC rank 7728.
//
// Rulings:
//   [2022-02-18] Discarding the card is part of the cost to activate a channel ability.
//   [2022-02-18] The owner of that permanent chooses whether it goes on top or bottom. Other
//     players get to know what they chose.
//   [2022-02-18] If a channel ability requires a target, you may not activate it without a target
//     just to discard the card.
//
// The mana ability's tap-another cost is Jaspera Sentinel's (activated by
// hand; the auto-payer skips a `tapOthers` mana ability rather than pay it
// wrongly — AUTHORING §15). Channel (rule 702.51a) is a hand ability that
// discards the card as its cost; the owner picks top or bottom.
const MANA_TEXT = "{T}, Tap an untapped artifact or creature you control: Add {C}.";
const CHANNEL_TEXT =
  "Channel — {4}{U}, Discard this card: The owner of target nonland permanent puts it on their choice of the top or bottom of their library.";

export default defineCard({
  name: "Moonsnare Prototype",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${CHANNEL_TEXT}`,
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        tapOthers: { count: 1, filter: { typesAnyOf: ["artifact", "creature"], controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{4}{U}", tap: false },
      targets: ["nonland-permanent"],
      effect: { kind: "put-on-library", target: 0, position: { ownerChooses: ["top", "bottom"] } },
      resolve: null,
      text: CHANNEL_TEXT,
      zone: "hand",
    },
  ],
});
