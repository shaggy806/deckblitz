import { defineCard } from "../define.js";
import { unearth } from "../helpers.js";

// EDHREC rank 9434.
//
// "Enters from a graveyard" is the `enteredFrom` filter (Oscorp Industries).
const CODES_TEXT = "Dynastic Codes — When this creature enters from a graveyard, you draw two cards and you lose 2 life.";

export default defineCard({
  name: "Triarch Praetorian",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Necron"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${CODES_TEXT}\nUnearth {4}{B} ({4}{B}: Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it would leave the battlefield. Unearth only as a sorcery.)`,
  activated: [unearth("{4}{B}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self", filter: { enteredFrom: "graveyard" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "lose-life", amount: 2 },
        ],
      },
      resolve: null,
      text: CODES_TEXT,
    },
  ],
});
