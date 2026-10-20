import { defineCard } from "../define.js";

/** The disturb back face of Devoted Grafkeeper. Its "exile it instead" is the
 * face's own ability (`self`), as Hook-Haunt Drifter's is. */
export default defineCard({
  name: "Departed Soulkeeper",
  art: "https://cards.scryfall.io/art_crop/back/9/6/965e6bd5-dc32-406c-bc99-ceb15be4d3f2.jpg",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature can block only creatures with flying.\nIf Departed Soulkeeper would be put into a graveyard from anywhere, exile it instead.",
  faces: ["Devoted Grafkeeper", "Departed Soulkeeper"],
  transform: true,
  disturb: { cost: "{1}{W}{U}" },
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { keyword: "flying" },
      text: "This creature can block only creatures with flying.",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Departed Soulkeeper would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
