import { defineCard } from "../define.js";

/** The disturb back face of Galedrifter (Hook-Haunt Drifter's shape). */
export default defineCard({
  name: "Waildrifter",
  art: "https://cards.scryfall.io/art_crop/back/e/b/eb34c472-c6ff-4d83-ac8b-a8f279593f98.jpg",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Hippogriff", "Spirit"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nIf Waildrifter would be put into a graveyard from anywhere, exile it instead.",
  faces: ["Galedrifter", "Waildrifter"],
  transform: true,
  disturb: { cost: "{4}{U}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Waildrifter would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
