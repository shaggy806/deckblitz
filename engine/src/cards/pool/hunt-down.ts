import { defineCard } from "../define.js";

// EDHREC rank 27714. Rimehorn Aurochs' shape: `must-block` naming slot 1 as
// the attacker. A second target gone illegal while it stays on the
// battlefield is still the creature to block (rule 608.2b names it, as
// Feral Contest's ruling reads); a first that can't block the second is
// under no requirement (the ruling).

export default defineCard({
  name: "Hunt Down",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Target creature blocks target creature this turn if able.",
  targets: ["creature", "creature"],
  effect: { kind: "restrict", target: 0, restrictions: [{ kind: "must-block", attacker: 1 }] },
});
