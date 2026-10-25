import { defineCard } from "../define.js";

// Zendikar (ZEN). EDHREC rank 27107. The Gitrog Monster's "sacrifice it
// unless you sacrifice a land", on entering.

const TEXT = "When this creature enters, sacrifice it unless you sacrifice a land.";

export default defineCard({
  name: "Scythe Tiger",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 2,
  keywords: ["shroud"],
  text: `Shroud (This creature can't be the target of spells or abilities.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
