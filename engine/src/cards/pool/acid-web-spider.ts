import { defineCard } from "../define.js";

export default defineCard({
  name: "Acid Web Spider",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, you may destroy target Equipment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", filter: { subtype: "Equipment" } }],
      effect: { kind: "may", prompt: "Destroy the targeted Equipment?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: "When this creature enters, you may destroy target Equipment.",
    },
  ],
});
