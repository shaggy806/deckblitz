import { defineCard } from "../define.js";

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
  text: "First strike, vigilance\nAkiri gets +1/+0 for each artifact you control.\nPartner (You can have two commanders if both have partner.)",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: "Akiri gets +1/+0 for each artifact you control.",
    },
  ],
});
