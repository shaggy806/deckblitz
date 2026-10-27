import { defineCard } from "../define.js";

// Apocalypse (APC). "Target Kavu" is any Kavu permanent.
const TEXT = "{1}{U}, {T}: Return target Kavu to its owner's hand.";

export default defineCard({
  name: "Coastal Drake",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Drake"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{U}", tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Kavu" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
