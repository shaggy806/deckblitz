import { defineCard } from "../define.js";

// EDHREC rank 26961. Secrets of Strixhaven. Converge's X is the colours of
// mana spent to cast it (a copy, or a free cast, spent none — the rulings);
// the cards exiled are as many as the excess damage dealt to the creature.

export default defineCard({
  name: "Archaic's Agony",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Converge — Archaic's Agony deals X damage to target creature, where X is the number of colors of mana spent to cast this spell. Exile cards from the top of your library equal to the excess damage dealt to that creature this way. You may play those cards until the end of your next turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: { colorsSpentOf: "source" }, target: 0 },
      {
        kind: "impulse-exile",
        amount: { excessDamageThisWay: true, to: 0 },
        duration: "your-next-turn",
      },
    ],
  },
});
