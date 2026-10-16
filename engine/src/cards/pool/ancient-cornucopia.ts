import { defineCard } from "../define.js";

// EDHREC rank 7884.
//
// "A spell that's one or more colors": any colour at all — five `anyOf`
// branches (All Is Dust's shape). The life is one per colour the spell has
// (`colorsOf`, read as it last existed if it was countered — the rulings),
// and "do this only once each turn" is the `may`'s `oncePerTurn`: declining
// doesn't use it up.
const LIFE_TEXT =
  "Whenever you cast a spell that's one or more colors, you may gain 1 life for each of that spell's colors. Do this only once each turn.";

export default defineCard({
  name: "Ancient Cornucopia",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${LIFE_TEXT}\n{T}: Add one mana of any color.`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }, { colors: ["G"] }],
        },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Gain 1 life for each of that spell's colors?",
        oncePerTurn: true,
        effect: { kind: "gain-life", amount: { colorsOf: "trigger-object" } },
      },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
