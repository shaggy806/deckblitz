import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31335.

const GRANTED = "{B}: Regenerate this creature.";

export default defineCard({
  name: "Defiling Tears",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, target creature becomes black, gets +1/-1, and gains "${GRANTED}"`,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "become-color", target: 0, colors: ["B"], duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: 1, toughness: -1, duration: "end-of-turn" },
      {
        kind: "grant-activated",
        target: 0,
        ability: {
          cost: { mana: "{B}", tap: false },
          targets: [],
          effect: { kind: "regenerate", target: "source" },
          resolve: null,
          text: GRANTED,
        },
        duration: "end-of-turn",
      },
    ],
  },
});
