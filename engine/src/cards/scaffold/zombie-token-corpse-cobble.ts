import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// Corpse Cobble's Zombie token.

export default defineCard({
  name: "Zombie Token (Corpse Cobble)",
  art: "eb5fb489-6e46-4359-9c3c-ef1702526e5a",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 0,
  toughness: 0,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)",
  // TODO(scaffold): P/T */* isn't a plain number — a characteristic-defining ability, or an X
});
