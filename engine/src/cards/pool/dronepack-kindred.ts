import { defineCard } from "../define.js";

export default defineCard({
  name: "Dronepack Kindred",
  art: "https://cards.scryfall.io/art_crop/back/4/6/460f7733-c0a6-4439-a313-7b26ae6ee15b.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 5,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\n{1}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{1}: This creature gets +1/+0 until end of turn.",
    },
  ],
  faces: ["Vildin-Pack Outcast", "Dronepack Kindred"],
  transform: true,
});
