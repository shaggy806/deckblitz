import { defineCard } from "../define.js";

// EDHREC rank 16205.

export default defineCard({
  name: "Spreading Plague",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a creature enters, destroy all other creatures that share a color with it. They can't be regenerated.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", sharesColorWith: "trigger-object" }, exceptTriggerObject: true, cantBeRegenerated: true },
      resolve: null,
      text: "Whenever a creature enters, destroy all other creatures that share a color with it. They can't be regenerated.",
    },
  ],
});
