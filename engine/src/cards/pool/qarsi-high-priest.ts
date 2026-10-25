import { defineCard } from "../define.js";

export default defineCard({
  name: "Qarsi High Priest",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 2,
  text: "{1}{B}, {T}, Sacrifice another creature: Manifest the top card of your library. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: { kind: "manifest", who: "you" },
      resolve: null,
      text: "{1}{B}, {T}, Sacrifice another creature: Manifest the top card of your library.",
    },
  ],
});
