import { defineCard } from "../define.js";

export default defineCard({
  name: "Elturgard Ranger",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Elf", "Ranger"],
  power: 4,
  toughness: 1,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, create a 2/2 green Wolf creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Wolf Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 2/2 green Wolf creature token.",
    },
  ],
});
