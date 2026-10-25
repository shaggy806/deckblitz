import { defineCard } from "../define.js";

const ATTACKING = { type: "creature", attacking: true } as const;

export default defineCard({
  name: "Pitfall Trap",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If exactly one creature is attacking, you may pay {W} rather than pay this spell's mana cost.\nDestroy target attacking creature without flying.",
  // Exactly one attacking creature on the whole battlefield: one on your
  // side and none on your opponents', or the other way round.
  alternativeCost: {
    mana: "{W}",
    condition: {
      kind: "any",
      of: [
        {
          kind: "all",
          of: [
            { kind: "controls", filter: ATTACKING, atLeast: 1 },
            { kind: "not", of: { kind: "controls", filter: ATTACKING, atLeast: 2 } },
            { kind: "not", of: { kind: "opponents-control-total", filter: ATTACKING, atLeast: 1 } },
          ],
        },
        {
          kind: "all",
          of: [
            { kind: "opponents-control-total", filter: ATTACKING, atLeast: 1 },
            { kind: "not", of: { kind: "opponents-control-total", filter: ATTACKING, atLeast: 2 } },
            { kind: "not", of: { kind: "controls", filter: ATTACKING, atLeast: 1 } },
          ],
        },
      ],
    },
  },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
});
