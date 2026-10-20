import { defineCard } from "../define.js";

// EDHREC rank 8108.
//
// Find a Crossing on a creature already blocked doesn't undo the block (the
// ruling): "can't be blocked" is checked only as blockers are declared.

export default defineCard({
  name: "You Come to a River",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Choose one —\n• Fight the Current — Return target nonland permanent to its owner's hand.\n• Find a Crossing — Target creature gets +1/+0 until end of turn and can't be blocked this turn.",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Fight the Current — Return target nonland permanent to its owner's hand.",
        targets: ["nonland-permanent"],
        effect: { kind: "return-to-hand", target: 0 },
      },
      {
        text: "Find a Crossing — Target creature gets +1/+0 until end of turn and can't be blocked this turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          ],
        },
      },
    ],
  },
});
