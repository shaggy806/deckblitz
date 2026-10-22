import { defineCard } from "../define.js";

// Aether Revolt. Whether you control a Tezzeret planeswalker is read as the
// ability resolves.
const TEXT = "{T}: Target opponent loses 1 life. If you control a Tezzeret planeswalker, that player loses 3 life instead.";

export default defineCard({
  name: "Tezzeret's Simulacrum",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent"],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Tezzeret" }, atLeast: 1 },
        then: { kind: "lose-life", amount: 3, target: 0 },
        else: { kind: "lose-life", amount: 1, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
