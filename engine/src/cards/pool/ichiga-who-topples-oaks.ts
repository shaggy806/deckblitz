import { defineCard } from "../define.js";

export default defineCard({
  name: "Ichiga, Who Topples Oaks",
  art: "https://cards.scryfall.io/art_crop/front/7/3/73636ca0-2309-4bb3-9300-8bd0c0bb5b31.jpg",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nRemove a ki counter from Ichiga: Target creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: false, removeCounter: { kind: "ki", count: 1 } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "Remove a ki counter from Ichiga: Target creature gets +2/+2 until end of turn.",
    },
  ],
  faces: ["Budoka Pupil", "Ichiga, Who Topples Oaks"],
  flip: true,
});
