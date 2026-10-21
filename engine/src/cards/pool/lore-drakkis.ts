import { defineCard } from "../define.js";

export default defineCard({
  name: "Lore Drakkis",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Beast"],
  power: 2,
  toughness: 3,
  mutate: "{U/R}{U/R}",
  text: "Mutate {U/R}{U/R} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, return target instant or sorcery card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "Whenever this creature mutates, return target instant or sorcery card from your graveyard to your hand.",
    },
  ],
});
