import { defineCard } from "../define.js";
import { soulshift } from "../helpers.js";

// EDHREC rank 24963.

export default defineCard({
  name: "Body of Jukai",
  manaCost: "{7}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 8,
  toughness: 5,
  keywords: ["trample"],
  text: "Trample\nSoulshift 8 (When this creature dies, you may return target Spirit card with mana value 8 or less from your graveyard to your hand.)",
  triggered: [soulshift(8)],
});
