import { defineCard } from "../define.js";

export default defineCard({
  name: "Seeker of Sunlight",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 1,
  toughness: 1,
  text: "{2}{G}: This creature explores. Activate only as a sorcery. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "{2}{G}: This creature explores. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
