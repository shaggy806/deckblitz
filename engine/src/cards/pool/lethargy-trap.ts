import { defineCard } from "../define.js";

// EDHREC rank 25338.
//
// "Three or more creatures are attacking": only the active player's creatures
// attack, so the three are all yours (`controls`) or all one opponent's
// (`opponent-controls`, some one opponent).

const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Lethargy Trap",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If three or more creatures are attacking, you may pay {U} rather than pay this spell's mana cost.\nAttacking creatures get -3/-0 until end of turn.",
  targets: [],
  effect: { kind: "modify-pt-all", filter: ATTACKING, power: -3, toughness: 0, duration: "end-of-turn" },
  alternativeCost: {
    mana: "{U}",
    condition: {
      kind: "any",
      of: [
        { kind: "controls", filter: ATTACKING, atLeast: 3 },
        { kind: "opponent-controls", filter: ATTACKING, atLeast: 3 },
      ],
    },
  },
});
