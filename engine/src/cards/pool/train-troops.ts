import { defineCard } from "../define.js";

// Imodane's Recruiter's Adventure.

export default defineCard({
  name: "Train Troops",
  art: "https://cards.scryfall.io/art_crop/back/4/d/4dbaa855-3f8e-42e6-8ec8-5ffbc5c8acf0.jpg",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Create two 2/2 white Knight creature tokens with vigilance. (Then exile this card. You may cast the creature later from exile.)",
  effect: { kind: "create-token", token: "Knight Token", count: 2 },
  faces: ["Imodane's Recruiter", "Train Troops"],
  adventure: true,
});
