import { defineCard } from "../define.js";

// EDHREC rank 15292.
//
// Whether you control an outlaw is asked as the spell resolves. Outlaws are
// permanents with any of the five types (the rulings), as Vihaan, Goldwaker.
const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

export default defineCard({
  name: "Take the Fall",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "Target creature gets -1/-0 until end of turn. It gets -4/-0 until end of turn instead if you control an outlaw. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.)\nDraw a card.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtypes: OUTLAWS }, atLeast: 1 },
        then: { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "end-of-turn" },
        else: { kind: "modify-pt", target: 0, power: -1, toughness: 0, duration: "end-of-turn" },
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
