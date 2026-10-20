import { defineCard } from "../define.js";

/** The disturb back face of Mourning Patrol (Hook-Haunt Drifter's shape). */
export default defineCard({
  name: "Morning Apparition",
  art: "https://cards.scryfall.io/art_crop/back/2/d/2d3687e2-09e0-4753-aa02-88a19bde3330.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nIf Morning Apparition would be put into a graveyard from anywhere, exile it instead.",
  faces: ["Mourning Patrol", "Morning Apparition"],
  transform: true,
  disturb: { cost: "{3}{W}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Morning Apparition would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
