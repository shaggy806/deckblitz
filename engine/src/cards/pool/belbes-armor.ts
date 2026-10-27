import { defineCard } from "../define.js";

// EDHREC rank 19573.

const TEXT = "{X}, {T}: Target creature gets -X/+X until end of turn.";

export default defineCard({
  name: "Belbe's Armor",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: ["creature"],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { product: ["x", -1] },
        toughness: "x",
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
