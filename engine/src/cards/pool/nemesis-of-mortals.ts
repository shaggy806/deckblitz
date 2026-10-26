import { defineCard } from "../define.js";

const ABILITY =
  "{7}{G}{G}: Monstrosity 5. This ability costs {1} less to activate for each creature card in your graveyard.";

export default defineCard({
  name: "Nemesis of Mortals",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 5,
  toughness: 5,
  text: `This spell costs {1} less to cast for each creature card in your graveyard.\n${ABILITY} (If this creature isn't monstrous, put five +1/+1 counters on it and it becomes monstrous.)`,
  selfCostReduction: {
    // Unconditional: the always-true gate Overwhelming Remorse uses. Generic mana only (the ruling).
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { cardsInGraveyard: { type: "creature" } },
  },
  activated: [
    {
      cost: { mana: "{7}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 5 },
      costReduction: { reduceGeneric: { cardsInGraveyard: { type: "creature" } } },
      resolve: null,
      text: ABILITY,
    },
  ],
});
