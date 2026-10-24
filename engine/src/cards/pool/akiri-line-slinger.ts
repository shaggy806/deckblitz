import { defineCard } from "../define.js";

// Commander 2016. EDHREC rank 10128. Guidelight Synergist's per-artifact
// bonus; partner is the `pairing`.
const PUMP_TEXT = "Akiri gets +1/+0 for each artifact you control.";

export default defineCard({
  name: "Akiri, Line-Slinger",
  manaCost: "{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kor", "Soldier", "Ally"],
  power: 0,
  toughness: 3,
  keywords: ["first-strike", "vigilance"],
  pairing: { kind: "partner" },
  text: `First strike, vigilance\n${PUMP_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
});
