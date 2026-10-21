import { defineCard } from "../define.js";

// EDHREC rank 17254.
//
// Rulings:
//   [2004-10-04] This is not damage prevention or redirection. It actually is life gain and newly
//     dealt damage.
//   [2004-10-04] You can't use Simulacrum on Loss of Life, just damage.
//   [2008-08-01] Simulacrum is the source of the damage.

const DAMAGE_TO_YOU = { turnStat: "damage-taken", who: "you" } as const;

export default defineCard({
  name: "Simulacrum",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You gain life equal to the damage dealt to you this turn. Simulacrum deals damage to target creature you control equal to the damage dealt to you this turn.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: DAMAGE_TO_YOU },
      { kind: "damage", amount: DAMAGE_TO_YOU, target: 0 },
    ],
  },
});
