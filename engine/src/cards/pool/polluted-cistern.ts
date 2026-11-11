import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The left door of Polluted Cistern // Dim Oubliette
// (polluted-cistern-dim-oubliette.ts). "Those cards" are the trigger's batch,
// each card type among them counted once.
const MILL_TEXT =
  "Whenever one or more cards are put into your graveyard from your library, each opponent loses 1 life for each card type among those cards.";

export default defineCard({
  name: "Polluted Cistern",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${MILL_TEXT}\n${ROOM_REMINDER}`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "you", from: "library", batched: true },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-opponent",
        amount: { aggregate: "distinct", of: "card-type", filter: {}, in: "trigger-batch" },
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  faces: ["Polluted Cistern // Dim Oubliette", "Polluted Cistern", "Dim Oubliette"],
  split: true,
});
