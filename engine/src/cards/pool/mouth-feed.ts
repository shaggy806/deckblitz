import { defineCard } from "../define.js";

const FACES = ["Mouth // Feed", "Mouth", "Feed"];

export default defineCard({
  name: "Mouth // Feed",
  manaCost: "{2}{G}{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Create a 3/3 green Hippo creature token.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nDraw a card for each creature you control with power 3 or greater.",
  faces: FACES,
  split: true,
});
