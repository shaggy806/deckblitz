import { defineCard } from "../define.js";

export default defineCard({
  name: "Inscription of Insight",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Kicker {2}{U}{U}\nChoose one. If this spell was kicked, choose any number instead.\n• Return up to two target creatures to their owners' hands.\n• Scry 2, then draw two cards.\n• Target player creates an X/X blue Illusion creature token, where X is the number of cards in their hand.",
  kicker: { cost: "{2}{U}{U}" },
  castModal: {
    minModes: 1,
    maxModes: 1,
    kickedModes: { min: 0, max: 3 },
    modes: [
      {
        text: "Return up to two target creatures to their owners' hands.",
        targets: [
          { kind: "optional", of: "creature" },
          { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
        ],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0 },
            { kind: "return-to-hand", target: 1 },
          ],
        },
      },
      {
        text: "Scry 2, then draw two cards.",
        targets: [],
        effect: { kind: "scry", amount: 2, then: { kind: "draw", amount: 2 } },
      },
      {
        text: "Target player creates an X/X blue Illusion creature token, where X is the number of cards in their hand.",
        targets: ["player"],
        effect: {
          kind: "create-token",
          token: "Illusion Token (Skyclave Apparition)",
          count: 1,
          who: { target: 0 },
          basePt: { power: { cardsInHand: { target: 0 } }, toughness: { cardsInHand: { target: 0 } } },
        },
      },
    ],
  },
});
