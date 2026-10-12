import { defineCard } from "../define.js";

export default defineCard({
  name: "Chilling Chronicle",
  art: "https://cards.scryfall.io/art_crop/back/c/a/caa57b63-bb11-45e8-8795-de92ca61f4f1.jpg",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "{1}, {T}: Tap target nonland permanent. Transform this artifact.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: ["nonland-permanent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "tap", target: 0 }, { kind: "transform", target: "source" }],
      },
      resolve: null,
      text: "{1}, {T}: Tap target nonland permanent. Transform this artifact.",
    },
  ],
  faces: ["Mysterious Tome", "Chilling Chronicle"],
  transform: true,
});
