import { defineCard } from "../define.js";

// EDHREC rank 13689.
//
// Each defending player's declaration of blockers is still theirs (rule
// 509.1a); the attacking player — the active one (rule 506.2) — makes it for
// them, obeying every requirement it can, here that each creature blocks if
// able (rule 509.1c). Who answers is `player-control.ts`'s: a "you choose how
// those creatures block" effect created after this entered (Master Warcraft)
// works instead, and a controlled attacking player's controller answers (rule
// 723).

const BLOCK = "All creatures block each combat if able.";
const CHOOSES = "The attacking player chooses how each creature blocks each combat.";

export default defineCard({
  name: "Invasion Plans",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${BLOCK}\n${CHOOSES}`,
  static: [
    { affects: { scope: "all-creatures" }, restrictions: ["must-block"], text: BLOCK },
    { affects: { scope: "self" }, attackingPlayerChoosesBlocks: true, text: CHOOSES },
  ],
});
