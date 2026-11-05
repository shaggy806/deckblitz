import { defineCard } from "../define.js";

const ENTERS = "When this creature enters, return each other creature you control to its owner's hand.";

export default defineCard({
  name: "Denizen of the Deep",
  manaCost: "{6}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 11,
  toughness: 11,
  text: ENTERS,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
