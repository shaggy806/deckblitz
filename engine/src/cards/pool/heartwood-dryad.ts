import { defineCard } from "../define.js";

const SHADOW_TEXT = "This creature can block creatures with shadow as though it had shadow.";

export default defineCard({
  name: "Heartwood Dryad",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 2,
  toughness: 1,
  text: SHADOW_TEXT,
  static: [{ affects: { scope: "self" }, blocksAsThoughShadow: true, text: SHADOW_TEXT }],
});
