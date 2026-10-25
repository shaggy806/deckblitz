import { defineCard } from "../define.js";

// "Four or more creatures are attacking": only the active player's creatures
// attack (rule 508.1a), so one player — you or one opponent — controls them
// all, Slingbow Trap's shape. The damage is divided as it's cast, at least 1
// to each target (rule 601.2d).

const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Arrow Volley Trap",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If four or more creatures are attacking, you may pay {1}{W} rather than pay this spell's mana cost.\nArrow Volley Trap deals 5 damage divided as you choose among any number of target attacking creatures.",
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: ATTACKING }, min: 1, max: 5 }],
  divided: { total: 5, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
  alternativeCost: {
    mana: "{1}{W}",
    condition: {
      kind: "any",
      of: [
        { kind: "controls", filter: ATTACKING, atLeast: 4 },
        { kind: "opponent-controls", filter: ATTACKING, atLeast: 4 },
      ],
    },
  },
});
