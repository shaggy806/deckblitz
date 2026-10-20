import { defineCard } from "../define.js";

/** The disturb back face of Covert Cutpurse. */
export default defineCard({
  name: "Covetous Geist",
  art: "https://cards.scryfall.io/art_crop/back/5/d/5db99746-8aee-42b8-acb0-ed69933d0ff8.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "deathtouch"],
  text: "Flying, deathtouch\nIf Covetous Geist would be put into a graveyard from anywhere, exile it instead.",
  faces: ["Covert Cutpurse", "Covetous Geist"],
  transform: true,
  disturb: { cost: "{4}{B}" },
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Covetous Geist would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
});
