import { defineCard } from "../define.js";

// EDHREC rank 13723.

export default defineCard({
  name: "Grim Giganotosaurus",
  manaCost: "{5}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 10,
  toughness: 10,
  text: "{10}{B}{G}: Monstrosity 10. This ability costs {1} less to activate for each creature with power 4 or greater your opponents control. (If this creature isn't monstrous, put ten +1/+1 counters on it and it becomes monstrous.)\nWhen this creature becomes monstrous, destroy all artifacts and creatures other than this creature.",
  activated: [
    {
      cost: { mana: "{10}{B}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 10 },
      resolve: null,
      costReduction: {
        reduceGeneric: { countOf: { type: "creature", power: { op: "gte", n: 4 }, controlledBy: "opponent" } },
      },
      text: "{10}{B}{G}: Monstrosity 10. This ability costs {1} less to activate for each creature with power 4 or greater your opponents control.",
    },
  ],
  triggered: [
    {
      trigger: { on: "event", event: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature"] }, exceptSource: true },
      resolve: null,
      text: "When this creature becomes monstrous, destroy all artifacts and creatures other than this creature.",
    },
  ],
});
