import { defineCard } from "../define.js";

// Only a legendary creature card, and the cost is the face's own mana cost with three
// other cards exiled from the graveyard.
const ENTERS_TEXT = "When this artifact enters, surveil 3.";
const ESCAPE_TEXT =
  "{T}: Target legendary creature card in your graveyard gains escape until end of turn. The escape cost is equal to its mana cost plus exile three other cards from your graveyard. (You may cast it from your graveyard for its escape cost this turn.)";

export default defineCard({
  name: "Confession Dial",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENTERS_TEXT}\n${ESCAPE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 3 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", supertype: "legendary" } }],
      effect: { kind: "grant-graveyard-keyword", target: 0, grant: { keyword: "escape", exileCount: 3 } },
      resolve: null,
      text: ESCAPE_TEXT,
    },
  ],
});
