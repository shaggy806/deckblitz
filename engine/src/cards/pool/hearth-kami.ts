import { defineCard } from "../define.js";

// EDHREC rank 27576. Gorilla Shaman's X-targeting with a sacrifice.

const TEXT = "{X}, Sacrifice this creature: Destroy target artifact with mana value X.";

export default defineCard({
  name: "Hearth Kami",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: false, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "artifact", manaValue: { op: "eq", n: "x" } } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
