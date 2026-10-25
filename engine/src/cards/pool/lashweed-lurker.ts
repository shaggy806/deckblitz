import { defineCard } from "../define.js";

// EDHREC rank 23873. Eldritch Moon.

export default defineCard({
  name: "Lashweed Lurker",
  manaCost: "{8}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Horror"],
  power: 5,
  toughness: 4,
  alternativeCost: { mana: "{5}{G}{U}", keyword: "emerge", emerge: { filter: { type: "creature" } } },
  text: "Emerge {5}{G}{U} (You may cast this spell by sacrificing a creature and paying the emerge cost reduced by that creature's mana value.)\nWhen you cast this spell, you may put target nonland permanent on top of its owner's library.",
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["nonland-permanent"],
      effect: {
        kind: "may",
        prompt: "Put target nonland permanent on top of its owner's library?",
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      resolve: null,
      text: "When you cast this spell, you may put target nonland permanent on top of its owner's library.",
    },
  ],
});
