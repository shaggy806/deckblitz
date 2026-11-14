import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 8919.
//
// Rulings:
//   You must choose two different colors. Colorless is not a color.
//
// The two colours are chosen one after the other as it enters, the second
// from the four left (`chooseOnEnterCount: 2`). "If it's at least one of the
// chosen colors" is an intervening if (rule 603.4) on the spell, asked as it's
// cast and again as the ability resolves (`trigger-object` with
// `ofChosenColor`, which matches either colour); the life is one for each of
// the chosen colours the spell is (`colorsOf` with `chosen`), read as it
// resolves — as the spell last was if it has left the stack.

const CAST_TEXT =
  "Whenever you cast a spell, if it's at least one of the chosen colors, you gain 1 life for each of the chosen colors it is.";

export default defineCard({
  name: "Tablet of the Guilds",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `As this artifact enters, choose two colors.\n${CAST_TEXT}`,
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  chooseOnEnterCount: 2,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      condition: { kind: "trigger-object", filter: { ofChosenColor: true } },
      targets: [],
      effect: { kind: "gain-life", amount: { colorsOf: "trigger-object", chosen: true } },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
