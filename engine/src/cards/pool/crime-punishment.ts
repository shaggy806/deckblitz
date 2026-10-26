import { defineCard } from "../define.js";

// Dissension. The whole card: every zone but the stack (rule 709.4) — both
// names, the combined mana cost, both halves' colours. Never cast itself; a
// spell is one half or the other (crime.ts, punishment.ts).
const FACES = ["Crime // Punishment", "Crime", "Punishment"];

export default defineCard({
  name: "Crime // Punishment",
  manaCost: "{3}{W}{B}{X}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["sorcery"],
  text: "Put target creature or enchantment card from an opponent's graveyard onto the battlefield under your control.\n//\nDestroy each artifact, creature, and enchantment with mana value X.",
  faces: FACES,
  split: true,
});
