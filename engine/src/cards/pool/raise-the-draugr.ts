import { defineCard } from "../define.js";

const CREATURE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } as const;

// Mode two's cards must share a creature type (`shares`), checked as it's cast
// and again as it resolves, a card gone read as it last was (the rulings).
export default defineCard({
  name: "Raise the Draugr",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text:
    "Choose one —\n" +
    "• Return target creature card from your graveyard to your hand.\n" +
    "• Return two target creature cards that share a creature type from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [CREATURE_CARD],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Return two target creature cards that share a creature type from your graveyard to your hand.",
        targets: [CREATURE_CARD, { kind: "other", of: CREATURE_CARD, than: { slot: 0 }, shares: { kind: "creature" } }],
        effect: {
          kind: "sequence",
          simultaneous: true,
          effects: [
            { kind: "return-to-hand", target: 0, from: "graveyard" },
            { kind: "return-to-hand", target: 1, from: "graveyard" },
          ],
        },
      },
    ],
  },
});
