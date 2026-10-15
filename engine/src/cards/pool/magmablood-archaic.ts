import { defineCard } from "../define.js";

// EDHREC rank 19486.
//
// Converge is Crystalline Crawler's replacement. The cast trigger reads the
// colours spent on the spell that fired it (`colorsSpentOf`), a copy or a
// free cast having spent none (the rulings).
//
// Rulings:
//   [2026-03-20] Magmablood Archaic's last ability resolves before the spell that caused it to
//     trigger. It resolves even if that spell is countered or otherwise leaves the stack.
//   [2026-03-20] If you cast a spell with converge without spending any mana to cast it (perhaps
//     because an effect allowed you to cast it without paying its mana cost), then the number of
//     colors spent to cast it will be zero.
//   [2026-03-20] The maximum number of colors of mana you can spend to cast a spell is five.
//     Colorless is not a color.

const CONVERGE_TEXT =
  "Converge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.";
const CAST_TEXT =
  "Whenever you cast an instant or sorcery spell, creatures you control get +1/+0 until end of turn for each color of mana spent to cast that spell.";

export default defineCard({
  name: "Magmablood Archaic",
  manaCost: "{2/R}{2/R}{2/R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${CONVERGE_TEXT}\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: { colorsSpentOf: "source" } } },
      text: CONVERGE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { colorsSpentOf: "trigger-object" },
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
