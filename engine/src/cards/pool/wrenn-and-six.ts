import { defineCard } from "../define.js";

// EDHREC rank 6553. The emblem's grant works from the command zone (rule
// 113.6p), so it outlasts Wrenn and Six.
const EMBLEM_TEXT = "Instant and sorcery cards in your graveyard have retrace.";
const ULTIMATE_TEXT = `−7: You get an emblem with "${EMBLEM_TEXT}" (You may cast instant and sorcery cards from your graveyard by discarding a land card in addition to paying their other costs.)`;

export default defineCard({
  name: "Wrenn and Six",
  manaCost: "{R}{G}",
  colors: ["R", "G"],
  types: ["planeswalker"],
  supertypes: ["legendary"],
  subtypes: ["Wrenn"],
  loyalty: 3,
  text: `+1: Return up to one target land card from your graveyard to your hand.\n−1: Wrenn and Six deals 1 damage to any target.\n${ULTIMATE_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "land" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "+1: Return up to one target land card from your graveyard to your hand.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: 1 },
      resolve: null,
      text: "−1: Wrenn and Six deals 1 damage to any target.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: EMBLEM_TEXT,
        static: {
          affects: { scope: "self" },
          grantsToGraveyard: {
            filter: { typesAnyOf: ["instant", "sorcery"] },
            keywords: [{ keyword: "retrace" }],
          },
          text: EMBLEM_TEXT,
        },
      },
      resolve: null,
      text: ULTIMATE_TEXT,
    },
  ],
});
