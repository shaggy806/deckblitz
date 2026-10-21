import { defineCard } from "../define.js";

export default defineCard({
  name: "Boneyard Lurker",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Nightmare", "Beast"],
  power: 4,
  toughness: 4,
  mutate: "{2}{B/G}{B/G}",
  text: "Mutate {2}{B/G}{B/G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, return target permanent card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "Whenever this creature mutates, return target permanent card from your graveyard to your hand.",
    },
  ],
});
