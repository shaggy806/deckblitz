import { defineCard } from "../define.js";

// Every player's noncreature, non-Equipment artifacts, its reach fixed in
// layer 4 (rule 613.6), so the Equipment it makes stay reached. Both X's are
// the artifact's own mana value: the equip cost's X is defined by the text
// (rule 107.3c, `xIs`), and the granted bonus reads the artifact holding it
// (`isSource`). An artifact that becomes a creature, or Bludgeon Brawl
// leaving, stops it being Equipment, and it falls off (rule 704.5n).

const GRANTED_TEXT = "Equipped creature gets +X/+0";
const TEXT =
  'Each noncreature, non-Equipment artifact is an Equipment with equip {X} and "Equipped creature gets +X/+0," where X is that artifact\'s mana value.';

export default defineCard({
  name: "Bludgeon Brawl",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { type: "artifact", notTypes: ["creature"], notSubtypes: ["Equipment"] } },
      addSubtypes: ["Equipment"],
      grantsStatic: [
        {
          affects: { scope: "attached" },
          grantPtPerCount: { aggregate: { aggregate: "sum", of: "mana-value", filter: { isSource: true } }, pt: [1, 0] },
          text: GRANTED_TEXT,
        },
      ],
      grantsActivated: [
        {
          cost: { mana: "{X}", tap: false },
          xIs: { manaValueOf: "source" },
          targets: ["creature-you-control"],
          effect: { kind: "attach", target: 0 },
          resolve: null,
          text: "Equip {X}",
          sorcerySpeed: true,
        },
      ],
      text: TEXT,
    },
  ],
});
