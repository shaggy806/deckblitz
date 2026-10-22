import { defineCard } from "../define.js";

// EDHREC rank 27694.
//
// Rulings:
//   [2017-04-18] "Whenever you cycle or discard a card" triggers only once if you cycle a card —
//     it's "whenever you discard a card" (Archfiend of Ifnir's `discards` + `perCard`), cycling
//     mentioned for clarity. A cleanup-step discard triggers it too.

export default defineCard({
  name: "Ominous Sphinx",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nWhenever you cycle or discard a card, target creature an opponent controls gets -2/-0 until end of turn.",
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "modify-pt", target: 0, power: -2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "Whenever you cycle or discard a card, target creature an opponent controls gets -2/-0 until end of turn.",
    },
  ],
});
