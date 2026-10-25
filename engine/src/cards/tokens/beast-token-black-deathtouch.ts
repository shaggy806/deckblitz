import { defineCard } from "../define.js";

/** 3/3 black Beast creature token with deathtouch — Garruk, Apex Predator's +1.
 * Distinct from the green 3/3 `3/3 Beast Token`. */
export default defineCard({
  name: "Beast Token (Black, Deathtouch)",
  art: "fc48bf5f-5fe1-41ef-a63d-85daacd941f7",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: "Deathtouch",
});
