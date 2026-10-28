import { defineCard } from "../define.js";

/** The land back face of Sejiri Shelter. */
export default defineCard({
  name: "Sejiri Glacier",
  art: "https://cards.scryfall.io/art_crop/back/f/2/f25d56f9-aa54-4657-9ac9-e93fbba3e715.jpg",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\n{T}: Add {W}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1 },
      resolve: null,
      text: "{T}: Add {W}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  faces: ["Sejiri Shelter", "Sejiri Glacier"],
});
