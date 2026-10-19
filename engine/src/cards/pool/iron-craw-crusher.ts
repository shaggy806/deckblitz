import { defineCard } from "../define.js";

// EDHREC rank 18650. The Brothers' War.

const ATTACK_TEXT =
  "Whenever this creature attacks, target attacking creature gets +X/+0 until end of turn, where X is this creature's power.";

export default defineCard({
  name: "Iron-Craw Crusher",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 6,
  text:
    "Prototype {2}{G}{G} — 2/5 (You may cast this spell with different mana cost, color, and size. " +
    "It keeps its abilities and types.)\n" +
    ATTACK_TEXT,
  prototype: { cost: "{2}{G}{G}", power: 2, toughness: 5 },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      // Any attacking creature, this one included. X is its power as the
      // ability resolves (as it last existed, if it has left).
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: { kind: "modify-pt", target: 0, power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
