import { defineCard } from "../define.js";

/** The disturb back face of Beloved Beggar. */
export default defineCard({
  name: "Generous Soul",
  art: "https://cards.scryfall.io/art_crop/back/6/1/6109b54e-56c5-4014-9f6d-d5f7a0fd725d.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nIf Generous Soul would be put into a graveyard from anywhere, exile it instead.",
  faces: ["Beloved Beggar", "Generous Soul"],
  transform: true,
  disturb: { cost: "{4}{W}{W}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Generous Soul would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
