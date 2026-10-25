import { defineCard } from "../define.js";
import { melee } from "../helpers.js";

export default defineCard({
  name: "Menagerie Liberator",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nMelee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)",
  triggered: [melee()],
});
