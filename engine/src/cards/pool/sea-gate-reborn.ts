import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/** The land back face of Sea Gate Restoration — Agadeem, the Undercrypt's shape. */
export default defineCard({
  name: "Sea Gate, Reborn",
  art: "https://cards.scryfall.io/art_crop/back/1/9/193071fe-180b-4d35-ba78-9c16675c29fc.jpg",
  colors: [],
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
  faces: ["Sea Gate Restoration", "Sea Gate, Reborn"],
});
