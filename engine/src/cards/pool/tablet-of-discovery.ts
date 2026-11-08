import { defineCard } from "../define.js";

// EDHREC rank 3302. Flagged "Build ASAP" (B273). The milled card gets a
// permission of its own for the turn, a land card included ("play"), with the
// land drop; one a replacement exiled instead (Rest in Peace) is still that
// card (rule 701.17c) and is played from exile.

const ENTER_TEXT = "When this artifact enters, mill a card. You may play that card this turn.";
const SPELL_MANA_TEXT = "{T}: Add {R}{R}. Spend this mana only to cast instant and sorcery spells.";

export default defineCard({
  name: "Tablet of Discovery",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  text: `${ENTER_TEXT} (To mill a card, put the top card of your library into your graveyard.)\n{T}: Add {R}.\n${SPELL_MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: "{T}: Add {R}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: 2,
        spendOnly: {
          spell: { typesAnyOf: ["instant", "sorcery"] },
          text: "Spend this mana only to cast instant and sorcery spells.",
        },
      },
      resolve: null,
      text: SPELL_MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "grant-play", cards: { thisWay: "milled" }, duration: "end-of-turn", play: true },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
