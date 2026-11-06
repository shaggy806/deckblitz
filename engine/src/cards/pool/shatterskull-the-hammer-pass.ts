import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

/** The land back face of Shatterskull Smashing — Agadeem, the Undercrypt's shape. */
export default defineCard({
  name: "Shatterskull, the Hammer Pass",
  colors: [],
  types: ["land"],
  text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {R}.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", mayPayLife: 3 },
      text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.",
    },
  ],
  activated: [manaTapAbility("R")],
  faces: ["Shatterskull Smashing", "Shatterskull, the Hammer Pass"],
});
