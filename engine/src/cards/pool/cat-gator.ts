import { defineCard } from "../define.js";

// EDHREC rank 18565. Omnath, Locus of the Roil's count, of Swamps.

const ETB_TEXT = "When this creature enters, it deals damage equal to the number of Swamps you control to any target.";

export default defineCard({
  name: "Cat-Gator",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fish", "Crocodile"],
  power: 3,
  toughness: 2,
  keywords: ["lifelink"],
  text: `Lifelink\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { countOf: { subtype: "Swamp", controlledBy: "you" } } },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
