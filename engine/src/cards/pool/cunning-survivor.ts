import { defineCard } from "../define.js";

// Rulings:
//   [2017-04-18] An ability that triggers whenever you "cycle or discard" a card triggers only
//     once if you cycle a card. The ability "Whenever you discard a card" is functionally
//     identical to this ability; cycling is mentioned for clarity.
// So it's a per-card `discards` trigger: cycling discards the card (rule
// 702.29a), which fires it once.

const TEXT = "Whenever you cycle or discard a card, this creature gets +1/+0 until end of turn and can't be blocked this turn.";

export default defineCard({
  name: "Cunning Survivor",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
