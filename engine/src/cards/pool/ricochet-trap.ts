import { defineCard } from "../define.js";

export default defineCard({
  name: "Ricochet Trap",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: "If an opponent cast a blue spell this turn, you may pay {R} rather than pay this spell's mana cost.\nChange the target of target spell with a single target.",
  // The {R} is offered once an opponent has cast a blue spell this turn; the
  // spell it then targets needn't be that one (the ruling).
  alternativeCost: {
    mana: "{R}",
    condition: { kind: "cast-this-turn", who: "opponent", filter: { colors: ["U"] } },
  },
  // Deflection's: the new target is chosen as this resolves, and must be a
  // change if any legal one exists (the rulings).
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
