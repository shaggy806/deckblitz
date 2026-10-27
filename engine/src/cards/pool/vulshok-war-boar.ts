import { defineCard } from "../define.js";

// EDHREC rank 31665. Scythe Tiger's shape, with an artifact.

const TEXT = "When this creature enters, sacrifice it unless you sacrifice an artifact.";

export default defineCard({
  name: "Vulshok War Boar",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "artifact" }, text: "Sacrifice an artifact" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
