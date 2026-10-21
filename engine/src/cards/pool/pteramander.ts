import { defineCard } from "../define.js";

export default defineCard({
  name: "Pteramander",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Salamander", "Drake"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\n{7}{U}: Adapt 4. This ability costs {1} less to activate for each instant and sorcery card in your graveyard. (If this creature has no +1/+1 counters on it, put four +1/+1 counters on it.)",
  activated: [
    {
      cost: { mana: "{7}{U}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 4 },
      },
      costReduction: { reduceGeneric: { cardsInGraveyard: { typesAnyOf: ["instant", "sorcery"] } } },
      resolve: null,
      text: "{7}{U}: Adapt 4. This ability costs {1} less to activate for each instant and sorcery card in your graveyard.",
    },
  ],
});
