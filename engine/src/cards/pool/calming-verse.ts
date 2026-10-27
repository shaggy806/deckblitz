import { defineCard } from "../define.js";

// EDHREC rank 16302.
//
// The untapped-land check is made as the spell resolves, after the first
// destruction (the ruling).

export default defineCard({
  name: "Calming Verse",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments you don't control. Then if you control an untapped land, destroy all enchantments you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "enchantment", controlledBy: "opponent" } },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "land", tapped: false }, atLeast: 1 },
        then: { kind: "destroy-all", filter: { type: "enchantment", controlledBy: "you" } },
      },
    ],
  },
});
