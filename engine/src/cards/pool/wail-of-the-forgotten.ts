import { defineCard } from "../define.js";

// EDHREC rank 14114. The Lost Caverns of Ixalan.
//
// Rulings:
//   [2023-11-10] If all targets for the chosen modes become illegal before Wail of the Forgotten
//     resolves, the spell will be countered and none of its effects will happen. If at least one
//     target is still legal, the spell will resolve but will have no effect on any illegal
//     targets.
//
// Let's Play a Game's "choose one … choose one or more instead", the
// condition descend 8 read as it's cast (`castModal.maxModesIf`).

const BOUNCE_TEXT = "Return target nonland permanent to its owner's hand.";
const DISCARD_TEXT = "Target opponent discards a card.";
const LOOK_TEXT =
  "Look at the top three cards of your library. Put one of them into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Wail of the Forgotten",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: `Descend 8 — Choose one. If there are eight or more permanent cards in your graveyard as you cast this spell, choose one or more instead.\n• ${BOUNCE_TEXT}\n• ${DISCARD_TEXT}\n• ${LOOK_TEXT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    maxModesIf: {
      condition: { kind: "cards-in-graveyard", atLeast: 8, filter: { notTypes: ["instant", "sorcery"] } },
      maxModes: 3,
    },
    modes: [
      {
        text: BOUNCE_TEXT,
        targets: ["nonland-permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: DISCARD_TEXT,
        targets: ["opponent"],
        effect: { kind: "discard", target: 0, amount: 1 },
      },
      {
        text: LOOK_TEXT,
        targets: [],
        effect: {
          kind: "look-and-choose",
          zone: "library",
          count: 3,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "graveyard",
        },
      },
    ],
  },
});
