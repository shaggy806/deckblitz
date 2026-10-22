import { defineCard } from "../define.js";

const FACES = ["Road // Ruin", "Road", "Ruin"];

export default defineCard({
  name: "Road // Ruin",
  manaCost: "{2}{G}{1}{R}{R}",
  colors: ["R", "G"],
  types: ["instant", "sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\n//\nAftermath (Cast this spell only from your graveyard. Then exile it.)\nRuin deals damage to target creature equal to the number of lands you control.",
  faces: FACES,
  split: true,
});
