import { defineCard } from "../define.js";

// EDHREC rank 17405. Eldritch Moon.

export default defineCard({
  name: "Vexing Scuttler",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Crab"],
  power: 4,
  toughness: 5,
  alternativeCost: { mana: "{6}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {6}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, you may return target instant or sorcery card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["instant", "sorcery"] },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Return target instant or sorcery card from your graveyard to your hand?",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: "When you cast this spell, you may return target instant or sorcery card from your graveyard to your hand.",
    },
  ],
});
