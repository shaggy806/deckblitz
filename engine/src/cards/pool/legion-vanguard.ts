import { defineCard } from "../define.js";

export default defineCard({
  name: "Legion Vanguard",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 2,
  text: "{1}, Sacrifice another creature: This creature explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "{1}, Sacrifice another creature: This creature explores.",
      otherOnly: true,
    },
  ],
});
