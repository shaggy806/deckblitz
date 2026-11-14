import { defineCard } from "../define.js";

// Whether you control one is checked as it resolves (the ruling).
export default defineCard({
  name: "Unagi's Spray",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gets -4/-0 until end of turn. If you control a Fish, Octopus, Otter, Seal, Serpent, or Whale, draw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: {
          kind: "controls",
          filter: { subtypes: ["Fish", "Octopus", "Otter", "Seal", "Serpent", "Whale"] },
          atLeast: 1,
        },
        then: { kind: "draw", amount: 1 },
      },
    ],
  },
});
