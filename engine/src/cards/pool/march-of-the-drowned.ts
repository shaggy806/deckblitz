import { defineCard } from "../define.js";

// EDHREC rank 10411. Both modes target, so a cast-time `castModal`. The second
// mode wants exactly two Pirate cards (two required slots, the second another
// than the first), returned together.

const PIRATE_CARD = { kind: "card-in-graveyard", whose: "you", filter: { subtype: "Pirate" } } as const;

export default defineCard({
  name: "March of the Drowned",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Choose one —\n" +
    "• Return target creature card from your graveyard to your hand.\n" +
    "• Return two target Pirate cards from your graveyard to your hand.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Return target creature card from your graveyard to your hand.",
        targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      {
        text: "Return two target Pirate cards from your graveyard to your hand.",
        targets: [PIRATE_CARD, { kind: "other", of: PIRATE_CARD, than: { slots: [0] } }],
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
