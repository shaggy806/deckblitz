import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 28685.
//
// Two effects for the turn: a player effect replacing the coloured mana any
// spell or ability its caster controls would add with white (rule 614.1a —
// `manaProduction.bySpellsAndAbilities`, {C} left as it is), and a timed
// static letting that white mana be spent as any colour (rule 609.4b). The
// rulings: no permanent changes colour, and no land becomes a Plains.

const FIRST = "Until end of turn, spells and abilities you control that would add colored mana instead add that much white mana.";
const SECOND = "Until end of turn, you may spend white mana as though it were mana of any color.";

export default defineCard({
  name: "False Dawn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `${FIRST} ${SECOND}\nDraw a card.`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "player-effect",
        duration: "end-of-turn",
        manaProduction: { produces: "W", colorsOnly: true, tapper: "you", bySpellsAndAbilities: true },
      },
      {
        kind: "timed-static",
        duration: "end-of-turn",
        text: SECOND,
        static: [{ affects: { scope: "self" }, spendManaAs: { as: { unit: "W", as: "any-color" } }, text: SECOND }],
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
