import { defineCard } from "../define.js";

export default defineCard({
  name: "Shidako, Broodmistress",
  art: "https://cards.scryfall.io/art_crop/front/a/4/a4f4aa3b-c64a-4430-b1a2-a7fca87d0a22.jpg",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 3,
  toughness: 3,
  text: "{G}, Sacrifice a creature: Target creature gets +3/+3 until end of turn.",
  activated: [
    {
      cost: { mana: "{G}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
      resolve: null,
      text: "{G}, Sacrifice a creature: Target creature gets +3/+3 until end of turn.",
    },
  ],
  faces: ["Orochi Eggwatcher", "Shidako, Broodmistress"],
  flip: true,
});
