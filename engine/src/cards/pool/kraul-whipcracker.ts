import { defineCard } from "../define.js";

const TEXT = "When this creature enters, destroy target token an opponent controls.";

export default defineCard({
  name: "Kraul Whipcracker",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Assassin"],
  power: 3,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { token: true } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
