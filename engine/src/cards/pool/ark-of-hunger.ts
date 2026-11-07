import { defineCard } from "../define.js";

// Flagged "Build ASAP". The milled card's permission is Tablet of Discovery's
// (`grant-graveyard-cast`'s `cards: "milled-this-way"` and `play`): a land card
// played with the land drop, and one a replacement exiled instead found there
// (rule 701.17c). Playing it from the graveyard is a card leaving it, which
// triggers the first ability (Fuming Effigy's batched trigger).

const LEAVE_TEXT =
  "Whenever one or more cards leave your graveyard, this artifact deals 1 damage to each opponent and you gain 1 life.";
const MILL_TEXT = "{T}: Mill a card. You may play that card this turn.";

export default defineCard({
  name: "Ark of Hunger",
  manaCost: "{2}{R}{W}",
  colors: ["R", "W"],
  types: ["artifact"],
  text: `${LEAVE_TEXT}\n${MILL_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 1 },
          { kind: "grant-graveyard-cast", cards: "milled-this-way", play: true },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
