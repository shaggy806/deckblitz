import { defineCard } from "../define.js";

// Visions (VIS). EDHREC rank 30647. The vigilance it grants has no end
// ("this effect lasts indefinitely").
const SAC_TEXT =
  "Sacrifice this creature: Put a +2/+2 counter on target Chimera creature. It gains vigilance. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Iron-Heart Chimera",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Chimera" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+2/+2", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "permanent" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
