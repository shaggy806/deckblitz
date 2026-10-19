import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

// Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] The mana created by Meeting of the Five can be spent on any portion of the cost
//     for a spell with exactly three colors, including any generic cost component or additional
//     costs it has.
//   [2022-04-29] You may cast any spells that have exactly three colors from among the cards exiled
//     this way, even if they aren't the same three colors.
//
// "Exactly three colors" is each of the ten three-colour sets with the
// other two colours ruled out (`colors` + `notColors`, in Amazing
// Spider-Man's `anyOf` shape). The permission is an impulse exile of ten,
// cast only, for those cards alone, this turn; the mana is Geosurge's
// `spendOnly` over the spell being cast, WUBRG twice.
const EXACTLY_THREE_COLORS: CardFilter = {
  anyOf: [
    { colors: ["W", "U", "B"], notColors: ["R", "G"] },
    { colors: ["W", "U", "R"], notColors: ["B", "G"] },
    { colors: ["W", "U", "G"], notColors: ["B", "R"] },
    { colors: ["W", "B", "R"], notColors: ["U", "G"] },
    { colors: ["W", "B", "G"], notColors: ["U", "R"] },
    { colors: ["W", "R", "G"], notColors: ["U", "B"] },
    { colors: ["U", "B", "R"], notColors: ["W", "G"] },
    { colors: ["U", "B", "G"], notColors: ["W", "R"] },
    { colors: ["U", "R", "G"], notColors: ["W", "B"] },
    { colors: ["B", "R", "G"], notColors: ["W", "U"] },
  ],
};
const SPEND_TEXT = "Spend this mana only to cast spells with exactly three colors.";

export default defineCard({
  name: "Meeting of the Five",
  manaCost: "{3}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: `Exile the top ten cards of your library. You may cast spells with exactly three colors from among them this turn. Add {W}{W}{U}{U}{B}{B}{R}{R}{G}{G}. ${SPEND_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "impulse-exile", amount: 10, duration: "end-of-turn", castOnly: true, filter: EXACTLY_THREE_COLORS },
      {
        kind: "add-mana",
        mana: { all: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: { spell: EXACTLY_THREE_COLORS, text: SPEND_TEXT },
      },
    ],
  },
});
