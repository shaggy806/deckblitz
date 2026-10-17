import { defineCard } from "../define.js";

// EDHREC rank 9154.
//
// Rulings:
//   [2023-10-13] You must still follow any timing restrictions and permissions, including those
//     based on the card's type. For instance, you can cast a sorcery using flashback only when you
//     could normally cast a sorcery.
//   [2023-10-13] A spell cast using flashback will always be exiled afterward, whether it
//     resolves, is countered, or leaves the stack in some other way.
//   [2023-10-13] You can cast a spell using flashback even if it was somehow put into your
//     graveyard without having been cast.
//
// One mode targets, so the mode is chosen as it's cast (`castModal`, Abrade's
// shape). The second mode is Teval, the Balanced Scale's mill-then-maybe-land
// (a land milled by it is among the choices).
const DESTROY_TEXT = "Destroy target artifact or enchantment.";
const MILL_TEXT = "Mill five cards, then you may put a land card from your graveyard onto the battlefield tapped.";

export default defineCard({
  name: "Wreck and Rebuild",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["sorcery"],
  flashback: { cost: "{3}{R}{G}" },
  text: `Choose one —\n• ${DESTROY_TEXT}\n• ${MILL_TEXT}\nFlashback {3}{R}{G}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DESTROY_TEXT,
        targets: ["artifact-or-enchantment"],
        effect: { kind: "destroy", target: 0 },
      },
      {
        text: MILL_TEXT,
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "mill", target: "you", amount: 5 },
            {
              kind: "look-and-choose",
              zone: "graveyard",
              min: 0,
              max: 1,
              destination: "battlefield",
              enterTapped: true,
              leftover: "stay",
              filter: { type: "land" },
            },
          ],
        },
      },
    ],
  },
});
