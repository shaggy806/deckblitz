import { defineCard } from "../define.js";

// The Brothers' War.
const PUMP_TEXT =
  "{1}, Sacrifice an artifact: This creature gets +1/+1 until end of turn and deals 1 damage to each opponent.";

export default defineCard({
  name: "Penregon Strongbull",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur"],
  power: 2,
  toughness: 3,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "damage", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
