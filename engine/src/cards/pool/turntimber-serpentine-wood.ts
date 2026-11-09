import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

// The land back face of Turntimber Symbiosis — Agadeem's shape.

export default defineCard({
  name: "Turntimber, Serpentine Wood",
  art: "https://cards.scryfall.io/art_crop/back/6/1/61bd69ea-1e9e-46b0-b1a1-ed7fdbe3deb6.jpg",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {G}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.",
    },
  ],
  activated: [manaTapAbility("G")],
  faces: ["Turntimber Symbiosis", "Turntimber, Serpentine Wood"],
});
