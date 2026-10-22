import { defineCard } from "../define.js";

// EDHREC rank 7914.

export default defineCard({
  name: "Grasping Dunes",
  colors: [],
  types: ["land"],
  subtypes: ["Desert"],
  text: "{T}: Add {C}.\n{1}, {T}, Sacrifice this land: Put a -1/-1 counter on target creature. Activate only as a sorcery.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{1}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 },
      resolve: null,
      text: "{1}, {T}, Sacrifice this land: Put a -1/-1 counter on target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
