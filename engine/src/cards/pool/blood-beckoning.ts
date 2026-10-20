import { defineCard } from "../define.js";

// EDHREC rank 13228.
//
// Kicked, the spell has other targets (Tear Asunder's shape): two different
// creature cards, returned as one event.

export default defineCard({
  name: "Blood Beckoning",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\nReturn target creature card from your graveyard to your hand. If this spell was kicked, instead return two target creature cards from your graveyard to your hand.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
  kicker: {
    cost: "{3}",
    targets: [
      { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      {
        kind: "other",
        of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
        than: { slots: [0] },
      },
    ],
    effect: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "return-to-hand", target: 0, from: "graveyard" },
        { kind: "return-to-hand", target: 1, from: "graveyard" },
      ],
    },
  },
});
