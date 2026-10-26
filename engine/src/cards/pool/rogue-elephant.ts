import { defineCard } from "../define.js";

// EDHREC rank 30321. Scythe Tiger's shape, narrowed to a Forest. Rulings: with
// no Forest to sacrifice, the Elephant is sacrificed; the choice is still
// offered if it has already left.

const TEXT = "When this creature enters, sacrifice it unless you sacrifice a Forest.";

export default defineCard({
  name: "Rogue Elephant",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ sacrifice: { subtype: "Forest" }, text: "Sacrifice a Forest" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
