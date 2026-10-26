import { defineCard } from "../define.js";

// Portal (POR). EDHREC rank 29943. Scythe Tiger's "sacrifice it unless you
// sacrifice a land", on attacking and for an Island.

const TEXT = "Whenever this creature attacks, sacrifice it unless you sacrifice an Island.";

export default defineCard({
  name: "Thing from the Deep",
  manaCost: "{6}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 9,
  toughness: 9,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { type: "land", subtype: "Island" }, text: "Sacrifice an Island" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
