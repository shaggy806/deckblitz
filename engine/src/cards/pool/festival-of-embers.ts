import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 11983.
//
// Kess's graveyard permission with an extra cost of life (`castFromGraveyard.payLife`),
// open only on your own turn; Rest in Peace's replacement narrowed to your graveyard —
// a card or token goes to its owner's graveyard, so "your graveyard" is what you own.
// A creature token of yours exiled this way never dies (the ruling), and Festival
// sacrificed by its own ability is exiled too (the ruling): it is still on the
// battlefield as its own move is redirected.
const CAST_TEXT =
  "During your turn, you may cast instant and sorcery spells from your graveyard by paying 1 life in addition to their other costs.";
const EXILE_TEXT = "If a card or token would be put into your graveyard from anywhere, exile it instead.";
const SAC_TEXT = "{1}{R}: Sacrifice this enchantment.";

export default defineCard({
  name: "Festival of Embers",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${CAST_TEXT}\n${EXILE_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castFromGraveyard: { filter: { typesAnyOf: ["instant", "sorcery"] }, yourTurnOnly: true, payLife: 1 },
      text: CAST_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you" } },
      text: EXILE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
