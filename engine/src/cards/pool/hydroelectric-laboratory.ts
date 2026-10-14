import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/** The land back face of Hydroelectric Specimen. */
export default defineCard({
  name: "Hydroelectric Laboratory",
  art: "https://cards.scryfall.io/art_crop/back/8/6/8689ecd7-e9a6-458b-99d2-6dbaca527f00.jpg",
  types: ["land"],
  text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {U}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.",
    },
  ],
  activated: [manaTapAbility("U")],
  faces: ["Hydroelectric Specimen", "Hydroelectric Laboratory"],
});
