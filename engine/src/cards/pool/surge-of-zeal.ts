import { defineCard } from "../define.js";

export default defineCard({
  name: "Surge of Zeal",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Radiance — Target creature and each other creature that shares a color with it gain haste until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "grant-keyword-all",
    filter: { type: "creature", sharesColorWithTarget: 0 },
    keyword: "haste",
    duration: "end-of-turn",
  },
});
