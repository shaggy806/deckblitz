import { defineCard } from "../define.js";

// EDHREC rank 8256. Bloomburrow.
export default defineCard({
  name: "Spellgyre",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Counter target spell.\n• Surveil 2, then draw two cards. (To surveil 2, look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Counter target spell.",
        targets: ["spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Surveil 2, then draw two cards.",
        targets: [],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "surveil", amount: 2 },
            { kind: "draw", amount: 2 },
          ],
        },
      },
    ],
  },
});
