import { defineCard } from "../define.js";

const TAPPED_TEXT = "As long as equipped creature is tapped, tapped creatures you control get +2/+0.";
const UNTAPPED_TEXT = "As long as equipped creature is untapped, untapped creatures you control get +0/+2.";
const TAP_TEXT = "{3}: You may tap or untap equipped creature.";

export default defineCard({
  name: "Sword of the Paruns",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TAPPED_TEXT}\n${UNTAPPED_TEXT}\n${TAP_TEXT}\nEquip {3}`,
  static: [
    {
      // Unattached, neither applies: no equipped creature is tapped or untapped.
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: true } },
      condition: { kind: "source", filter: { attachedTo: { tapped: true } } },
      grantPt: [2, 0],
      text: TAPPED_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: false } },
      condition: { kind: "source", filter: { attachedTo: { tapped: false } } },
      grantPt: [0, 2],
      text: UNTAPPED_TEXT,
    },
  ],
  activated: [
    {
      // "You may": tap it, untap it, or neither, chosen as it resolves.
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: "attached" } },
          { text: "Untap it", effect: { kind: "untap", target: "attached" } },
        ],
      },
      resolve: null,
      text: TAP_TEXT,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
