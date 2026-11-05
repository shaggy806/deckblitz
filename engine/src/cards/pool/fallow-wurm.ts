import { defineCard } from "../define.js";

// EDHREC rank 30767.

export default defineCard({
  name: "Fallow Wurm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  text: "When this creature enters, sacrifice it unless you discard a land card.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a land card?",
        effect: { kind: "discard", target: "you", amount: 1, filter: { type: "land" } },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "When this creature enters, sacrifice it unless you discard a land card.",
    },
  ],
});
