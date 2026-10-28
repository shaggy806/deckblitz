import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/** The land back face of Agadeem's Awakening — Emeria, Shattered Skyclave's shape. */
export default defineCard({
  name: "Agadeem, the Undercrypt",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {B}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.",
    },
  ],
  activated: [manaTapAbility("B")],
  faces: ["Agadeem's Awakening", "Agadeem, the Undercrypt"],
});
