import { defineCard } from "../define.js";

export default defineCard({
  name: "Scarmaker",
  art: "https://cards.scryfall.io/art_crop/front/2/8/28f72260-c8f9-4c44-92b5-23cef6690fdd.jpg",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: "Remove a ki counter from Scarmaker: Target creature gains fear until end of turn. (It can't be blocked except by artifact creatures and/or black creatures.)",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ki", count: 1 } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      resolve: null,
      text: "Remove a ki counter from Scarmaker: Target creature gains fear until end of turn.",
    },
  ],
  faces: ["Hired Muscle", "Scarmaker"],
  flip: true,
});
