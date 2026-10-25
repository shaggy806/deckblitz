import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 24218.
//
// Rulings:
//   [2014-02-01] You can tap a creature that hasn't been under your control since your most recent
//     turn began to activate the last ability.

export default defineCard({
  name: "Black Oak of Odunos",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Treefolk"],
  power: 0,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender\n{B}, Tap another untapped creature you control: This creature gets +1/+1 until end of turn.",
  // TODO(scaffold): {B}, Tap another untapped creature you control: This creature gets +1/+1 until end of turn.
});
