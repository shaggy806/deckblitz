import { defineCard } from "../define.js";

export default defineCard({
  name: "Rustspore Ram",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Sheep"],
  power: 1,
  toughness: 3,
  text: "When this creature enters, destroy target Equipment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "any", filter: { subtype: "Equipment" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target Equipment.",
    },
  ],
});
