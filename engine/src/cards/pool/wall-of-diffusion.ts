import { defineCard } from "../define.js";

const SHADOW_TEXT = "This creature can block creatures with shadow as though it had shadow.";

export default defineCard({
  name: "Wall of Diffusion",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n" + SHADOW_TEXT,
  static: [{ affects: { scope: "self" }, blocksAsThoughShadow: true, text: SHADOW_TEXT }],
});
