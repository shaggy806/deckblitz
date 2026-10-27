import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 11577.
//
// Sage of the Maze's "two mana in any combination of colors" on Implements
// of Sacrifice's sacrifice cost, and Chromatic Star's draw: the mana is made
// (colours chosen) before the draw trigger resolves, as the rulings say, and
// the draw happens however it reaches a graveyard from the battlefield.

const MANA_TEXT = "{2}, {T}, Sacrifice this artifact: Add two mana in any combination of colors.";
const DRAW_TEXT = "When this artifact is put into a graveyard from the battlefield, draw a card.";

export default defineCard({
  name: "Terrarion",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${MANA_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U", "B", "R", "G"] }, amount: 2 },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"] },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
});
