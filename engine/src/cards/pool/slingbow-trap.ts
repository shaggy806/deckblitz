import { defineCard } from "../define.js";

// EDHREC rank 29720.
//
// Rulings:
//   [2010-03-01] An “attacking creature” is one that has been declared as an attacker this combat,
//     or one that was put onto the battlefield attacking this combat. Unless that creature leaves
//     combat, it continues to be an attacking creature through the end of combat step, even if the
//     player it was attacking has left the game, or the planeswalker it was attacking has left
//     combat.
//   [2010-03-01] If you cast Slingbow Trap for {G}, you may target any attacking creature with
//     flying, not just a black one.
//
// "A black creature with flying is attacking" is anyone's: yours (`controls`)
// or some opponent's (`opponent-controls`).

const BLACK_FLYER_ATTACKING = { type: "creature", colors: ["B"], keyword: "flying", attacking: true } as const;

export default defineCard({
  name: "Slingbow Trap",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If a black creature with flying is attacking, you may pay {G} rather than pay this spell's mana cost.\nDestroy target attacking creature with flying.",
  targets: [{ kind: "permanent", filter: { attacking: true, type: "creature", keyword: "flying" } }],
  effect: { kind: "destroy", target: 0 },
  alternativeCost: {
    mana: "{G}",
    condition: {
      kind: "any",
      of: [
        { kind: "controls", filter: BLACK_FLYER_ATTACKING, atLeast: 1 },
        { kind: "opponent-controls", filter: BLACK_FLYER_ATTACKING, atLeast: 1 },
      ],
    },
  },
});
