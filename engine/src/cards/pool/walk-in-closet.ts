import { defineCard } from "../define.js";
import { ROOM_REMINDER } from "../helpers.js";

// The left door of Walk-In Closet // Forgotten Cellar.
const PLAY = "You may play lands from your graveyard.";
const FACES = ["Walk-In Closet // Forgotten Cellar", "Walk-In Closet", "Forgotten Cellar"];

export default defineCard({
  name: "Walk-In Closet",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Room"],
  text: `${PLAY}\n${ROOM_REMINDER}`,
  static: [{ affects: { scope: "self" }, playFromGraveyard: { type: "land" }, text: PLAY }],
  faces: FACES,
  split: true,
});
