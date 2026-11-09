import { defineCard } from "../define.js";

// EDHREC rank 3278. Heavenly Blademaster's count, +1/+0.

const TEXT = "Other creatures you control get +1/+0 for each Aura and Equipment attached to Kellan.";

export default defineCard({
  name: "Kellan, the Fae-Blooded",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Faerie"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you" }, excludeSelf: true },
      grantPtPerCount: { filter: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } }, pt: [1, 0] },
      text: TEXT,
    },
  ],
  faces: ["Kellan, the Fae-Blooded", "Birthright Boon"],
  adventure: true,
});
