import { defineCard } from "../define.js";

export default defineCard({
  name: "Novablast Wurm",
  manaCost: "{3}{G}{G}{W}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  text: "Whenever this creature attacks, destroy all other creatures.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature" }, exceptSource: true },
      resolve: null,
      text: "Whenever this creature attacks, destroy all other creatures.",
    },
  ],
});
