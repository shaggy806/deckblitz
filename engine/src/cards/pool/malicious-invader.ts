import { defineCard } from "../define.js";

// The back face of Innocent Traveler.
const TEXT = "This creature gets +2/+0 as long as an opponent controls a Human.";

export default defineCard({
  name: "Malicious Invader",
  art: "https://cards.scryfall.io/art_crop/back/1/3/13a5e5fd-a67a-4c0e-97ae-923bdbc1be20.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "opponent-controls", filter: { subtype: "Human" }, atLeast: 1 },
      grantPt: [2, 0],
      text: TEXT,
    },
  ],
  faces: ["Innocent Traveler", "Malicious Invader"],
  transform: true,
});
