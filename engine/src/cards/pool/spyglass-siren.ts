import { defineCard } from "../define.js";

export default defineCard({
  name: "Spyglass Siren",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Map Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Map token.",
    },
  ],
});
