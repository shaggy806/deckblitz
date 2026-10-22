import { defineCard } from "../define.js";

// EDHREC rank 24308.
//
// Rulings:
//   An ability that triggers whenever you "cycle or discard" a card triggers
//   only once if you cycle a card. The ability "Whenever you discard a card"
//   is functionally identical to this ability; cycling is mentioned for
//   clarity.
//
// So it is Hobgoblin, Mantled Marauder's per-card discard trigger: cycling
// discards the card as its cost.

const TRIGGER = "Whenever you cycle or discard a card, this creature gets +2/+0 until end of turn.";

export default defineCard({
  name: "Grisly Survivor",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minotaur", "Warrior"],
  power: 2,
  toughness: 3,
  text: TRIGGER,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: TRIGGER,
    },
  ],
});
