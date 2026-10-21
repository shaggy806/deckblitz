import { defineCard } from "../define.js";

// EDHREC rank 12937. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] If an effect allows you to cast a spell "as though" it has flash, Slitherwisp's
//     last ability won't trigger.
//   [2020-04-17] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.
//
// "Another spell": Slitherwisp is on the battlefield, so every spell cast is
// another one. The `keyword` clause reads the spell's own keywords, never a
// cast-as-though-it-had-flash permission (the ruling).

const CAST_TEXT = "Whenever you cast another spell that has flash, you draw a card and each opponent loses 1 life.";

export default defineCard({
  name: "Slitherwisp",
  manaCost: "{U}{B}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Elemental", "Nightmare"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { keyword: "flash" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "lose-life", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
