import { defineCard } from "../define.js";

// Inspired Skypainter's prepare spell (rule 722): no card of its own, only
// ever cast as the copy a prepared Skypainter makes in exile (722.3c). The
// token copies the creature's copiable values only (rule 707.2) and gains
// haste until end of turn — not a copiable value.
export default defineCard({
  name: "Maestro's Gift",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["sorcery"],
  prepareSpellOnly: true,
  text: "Create a token that's a copy of target creature you control. That token gains haste until end of turn.",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1, who: "you", gainUntilEndOfTurn: ["haste"] },
});
