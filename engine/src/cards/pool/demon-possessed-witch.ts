import { defineCard } from "../define.js";

const TEXT = "When this creature transforms into Demon-Possessed Witch, you may destroy target creature.";

export default defineCard({
  name: "Demon-Possessed Witch",
  art: "https://cards.scryfall.io/art_crop/back/e/3/e326d5f4-63e1-45fa-8c48-6fdc05709c52.jpg",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Destroy the targeted creature?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Kindly Stranger", "Demon-Possessed Witch"],
  transform: true,
});
