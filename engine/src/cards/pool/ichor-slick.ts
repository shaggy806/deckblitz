import { defineCard } from "../define.js";

// REVIEW — auto-finished by `npm run card:scaffold` from the Oracle snapshot: every line
// of its text matched a template, so nothing was left to author. Not in the registry:
// check it against the card's Oracle text, then move it into cards/pool/ (or tokens/)
// and run `npm run gen:cards -w engine`.
// EDHREC rank 17569.

export default defineCard({
  name: "Ichor Slick",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  madness: { cost: "{3}{B}" },
  text: "Target creature gets -3/-3 until end of turn.\nCycling {2} ({2}, Discard this card: Draw a card.)\nMadness {3}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: -3, toughness: -3, duration: "end-of-turn" },
});
