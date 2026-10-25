import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 30118.

export default defineCard({
  name: "Mischief and Mayhem",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Up to two target creatures each get +4/+4 until end of turn.",
  // TODO(scaffold): Up to two target creatures each get +4/+4 until end of turn.
});
