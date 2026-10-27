import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 28408. Gaea's Might's domain pump on an activation.

const ARMOR =
  "Domain — {3}, {T}: Target creature gets +1/+1 until end of turn for each basic land type among lands you control.";

export default defineCard({
  name: "Power Armor",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: ARMOR,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { basicLandTypes: "you" },
        toughness: { basicLandTypes: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ARMOR,
    },
  ],
});
