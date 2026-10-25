import { defineCard } from "../define.js";

// EDHREC rank 28007.

export default defineCard({
  name: "Abzan Kin-Guard",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: "This creature has lifelink as long as you control a white or black permanent.",
  static: [
    {
      affects: { scope: "self" },
      // "A white or black permanent" — itself included, should it become one.
      condition: {
        kind: "controls",
        filter: { anyOf: [{ colors: ["W"] }, { colors: ["B"] }] },
        atLeast: 1,
        countsSelf: true,
      },
      grantKeywords: ["lifelink"],
      text: "This creature has lifelink as long as you control a white or black permanent.",
    },
  ],
});
