import { defineCard } from "../define.js";

export default defineCard({
  name: "Benevolent Geist",
  art: "https://cards.scryfall.io/art_crop/back/e/7/e79269af-63eb-43d2-afee-c38fa14a0c5b.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nNoncreature spells you control can't be countered.\nIf Benevolent Geist would be put into a graveyard from anywhere, exile it instead.",
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["creature"] }, cantBeCountered: true },
      text: "Noncreature spells you control can't be countered.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Benevolent Geist would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
  faces: ["Malevolent Hermit", "Benevolent Geist"],
  transform: true,
});
