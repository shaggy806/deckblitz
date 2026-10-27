import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 26161.
//
// Rulings:
//   [2013-04-15] If you activate the ability during the end of combat step, the creature will be
//     destroyed at the beginning of the next end of combat step, even if that step occurs during a
//     different turn.
//
// Goblin Sappers' delayed destroy of the ability's target: an `end-of-combat`
// delayed trigger made during that step waits for the next one (the ruling).

const TEXT = "{3}{B}: Destroy target blocking creature at end of combat.";

export default defineCard({
  name: "Silent Assassin",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary", "Assassin"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { blocking: true, type: "creature" } }],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        text: "Destroy that creature.",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
