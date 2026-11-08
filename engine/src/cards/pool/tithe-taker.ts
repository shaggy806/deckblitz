import { defineCard } from "../define.js";
import { afterlife } from "../helpers.js";

const TAX =
  "During your turn, spells your opponents cast cost {1} more to cast and abilities your opponents activate cost {1} more to activate unless they're mana abilities.";

export default defineCard({
  name: "Tithe Taker",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: `${TAX}\nAfterlife 1 (When this creature dies, create a 1/1 white and black Spirit creature token with flying.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      costModification: { applies: {}, increaseGeneric: 1, when: { caster: "opponent" } },
      text: TAX,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      // Abilities activated from any zone (the triage's all-zones key).
      abilityCostModification: {
        applies: {},
        increaseGeneric: 1,
        exceptManaAbilities: true,
        anyZone: true,
        byOpponents: true,
      },
      text: TAX,
    },
  ],
  triggered: [afterlife(1)],
});
