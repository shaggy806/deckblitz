import { defineCard } from "../define.js";

// EDHREC rank 16025.
//
// Blacksmith's Talent's attach: the Equipment is target 0, the creature an
// optional target 1 — with none chosen, nothing moves.

const ENTER_TEXT = "When this creature enters, attach target Equipment you control to up to one target creature you control.";

export default defineCard({
  name: "Iron Hills Stalwart",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 4,
  toughness: 5,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "permanent", whose: "you", filter: { subtype: "Equipment" } },
        { kind: "optional", of: "creature-you-control" },
      ],
      effect: { kind: "attach", target: 1, attachment: 0 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
