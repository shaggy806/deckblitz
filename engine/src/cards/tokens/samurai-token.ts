import { defineCard } from "../define.js";

/** 2/2 white Samurai with vigilance — made by The Wandering Emperor's −1. */
export default defineCard({
  name: "Samurai Token",
  // The Kamigawa: Neon Dynasty Samurai token The Wandering Emperor mints.
  art: "f68e5337-6e44-4f8f-a102-2f97b433beea",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Samurai"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance",
});
