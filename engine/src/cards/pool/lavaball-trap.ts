import { defineCard } from "../define.js";

// EDHREC rank 23204.
//
// "An opponent had two or more lands enter": one opponent's own count — a
// land each from two opponents isn't two for either (`turn-history` with
// `who: "opponent"` tests each opponent alone).

export default defineCard({
  name: "Lavaball Trap",
  manaCost: "{6}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent had two or more lands enter the battlefield under their control this turn, you may pay {3}{R}{R} rather than pay this spell's mana cost.\nDestroy two target lands. Lavaball Trap deals 4 damage to each creature.",
  alternativeCost: {
    mana: "{3}{R}{R}",
    condition: { kind: "turn-history", what: "entered", who: "opponent", filter: { type: "land" }, atLeast: 2 },
  },
  targets: [{ kind: "any-number", of: "land", min: 2, max: 2 }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "destroy", target: 0 },
        simultaneous: true,
      },
      { kind: "damage-all", amount: 4, filter: { type: "creature" } },
    ],
  },
});
