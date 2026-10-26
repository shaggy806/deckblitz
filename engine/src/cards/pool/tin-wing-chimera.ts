import { defineCard } from "../define.js";

const TEXT = "Sacrifice this creature: Put a +2/+2 counter on target Chimera creature. It gains flying.";

export default defineCard({
  name: "Tin-Wing Chimera",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Chimera"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (This effect lasts indefinitely.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Chimera" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+2/+2", amount: 1 },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "permanent" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
