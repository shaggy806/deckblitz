import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19707. A Clue Equipment (Clue is an artifact type): "{2},
// Sacrifice this Equipment: Draw a card" is its own ability, and any "Clue"
// filter or "whenever you sacrifice a Clue" reads its subtype.

const TAP_TEXT = "{3}, {T}: Tap target creature.";
const STATIC_TEXT = `Equipped creature gets +1/+1 and has vigilance and "${TAP_TEXT}"`;

export default defineCard({
  name: "Wrench",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Clue", "Equipment"],
  text: `${STATIC_TEXT}\n{2}, Sacrifice this Equipment: Draw a card.\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      grantsActivated: [
        {
          cost: { mana: "{3}", tap: true },
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: TAP_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Sacrifice this Equipment: Draw a card.",
    },
    equip("{2}"),
  ],
});
