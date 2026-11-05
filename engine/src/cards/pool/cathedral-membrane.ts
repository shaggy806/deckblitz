import { defineCard } from "../define.js";

// "Each creature it blocked this combat": `blockedThisTurn`'s `"blocked-by"` side bound to
// this creature (`of: "source"`), this combat's blocks only.

const TEXT = "When this creature dies during combat, it deals 6 damage to each creature it blocked this combat.";

export default defineCard({
  name: "Cathedral Membrane",
  manaCost: "{1}{W/P}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Wall"],
  power: 0,
  toughness: 3,
  keywords: ["defender"],
  text: `({W/P} can be paid with either {W} or 2 life.)\nDefender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "turn-structure", duringCombat: true },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", blockedThisTurn: { relation: "blocked-by", of: "source", thisCombat: true } },
        amount: 6,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
