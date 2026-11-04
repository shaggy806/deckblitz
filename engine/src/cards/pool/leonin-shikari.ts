import { defineCard } from "../define.js";

const TEXT = "You may activate equip abilities any time you could cast an instant.";

export default defineCard({
  name: "Leonin Shikari",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [{ affects: { scope: "self" }, equipAtInstantSpeed: true, text: TEXT }],
});
