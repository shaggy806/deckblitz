import { defineCard } from "../define.js";

// EDHREC rank 32143.

export default defineCard({
  name: "Pelia, Immortal Innovator",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lanthanite", "Artificer"],
  power: 3,
  toughness: 3,
  text: "When Pelia enters, return target creature an opponent controls to its owner's hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "When Pelia enters, return target creature an opponent controls to its owner's hand.",
    },
  ],
});
