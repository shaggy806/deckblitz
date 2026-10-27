import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 24170.
//
// The alternative cost is Sephara's shape — no mana, one untapped creature
// you control tapped — gated on controlling a Plains as it's cast. "Cast
// only during combat" binds either way of casting it.

const ALT = "If you control a Plains, you may tap an untapped creature you control rather than pay this spell's mana cost.";
const TIMING = "Cast this spell only during combat.";
const EFFECT = "Create a 4/4 white Angel creature token with flying. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Angelic Favor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `${ALT}\n${TIMING}\n${EFFECT}`,
  alternativeCost: {
    mana: "{0}",
    tapCreatures: { count: 1, filter: { type: "creature" } },
    condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
  },
  castOnlyIf: { kind: "turn-structure", duringCombat: true },
  effect: { kind: "create-token", token: "4/4 Angel Token", count: 1, exileAtEndStep: true },
});
