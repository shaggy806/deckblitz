import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30181.
//
// Ruling: the creature is chosen on resolution, not targeted — the Zombie
// itself qualifies.

const GATE = "When this creature enters, return a black or red creature you control to its owner's hand.";
const PUMP = "{2}: This creature gets +1/+0 until end of turn.";

export default defineCard({
  name: "Lava Zombie",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 3,
  text: `${GATE}\n${PUMP}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["B"] }, { colors: ["R"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a black or red creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
  ],
});
