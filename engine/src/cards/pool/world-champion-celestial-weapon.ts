import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The back face of Sidequest: Play Blitzball.
const OVERDRIVE_TEXT = "Double Overdrive — Equipped creature gets +2/+0 and has double strike.";

export default defineCard({
  name: "World Champion, Celestial Weapon",
  art: "https://cards.scryfall.io/art_crop/back/3/1/31e2ad37-73cf-4858-8a3a-fc1165cd21a7.jpg",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${OVERDRIVE_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["double-strike"],
      text: OVERDRIVE_TEXT,
    },
  ],
  activated: [equip("{3}")],
  faces: ["Sidequest: Play Blitzball", "World Champion, Celestial Weapon"],
  transform: true,
});
