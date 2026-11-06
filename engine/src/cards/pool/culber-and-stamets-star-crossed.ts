import { defineCard } from "../define.js";

// EDHREC rank 32424.

const ETB_TEXT = "When Culber and Stamets enter, choose one —";

export default defineCard({
  name: "Culber and Stamets, Star-Crossed",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor", "Artificer"],
  power: 3,
  toughness: 4,
  text: `${ETB_TEXT}\n• Put a +1/+1 counter on target creature.\n• Add two mana of any one color.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Put a +1/+1 counter on target creature.",
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          },
          { text: "Add two mana of any one color.", effect: { kind: "add-mana", mana: "any-color", amount: 2 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
