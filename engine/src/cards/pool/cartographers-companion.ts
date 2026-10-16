import { defineCard } from "../define.js";

export default defineCard({
  name: "Cartographer's Companion",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Gnome"],
  power: 2,
  toughness: 1,
  text: "When this creature enters, create a Map token. (It's an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
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
