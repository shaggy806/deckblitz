import { defineCard } from "../define.js";

// Back face of Voltaic Visionary.

export default defineCard({
  name: "Volt-Charged Berserker",
  art: "https://cards.scryfall.io/art_crop/back/a/8/a8b85386-462b-46f8-9412-fd47ed1dc1da.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 4,
  toughness: 3,
  text: "This creature can't block.",
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: "This creature can't block." }],
  faces: ["Voltaic Visionary", "Volt-Charged Berserker"],
  transform: true,
});
