import { defineCard } from "../define.js";

// The card is exiled first; then the choice: two energy, or — declining — a
// permission to play the card exiled this way this turn (lands included).
export default defineCard({
  name: "Synth Eradicator",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  subtypes: ["Synth", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["haste"],
  text:
    "Haste\n" +
    "Whenever this creature attacks, exile the top card of your library. You may get {E}{E} (two energy counters). If you don't, you may play that card this turn.\n" +
    "{T}, Pay {E}{E}{E}: This creature deals 3 damage to any target.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 1 },
          {
            kind: "may",
            prompt: "Get {E}{E}? (If you don't, you may play the exiled card this turn.)",
            effect: { kind: "get-energy", amount: 2 },
            else: { kind: "grant-play", cards: { thisWay: "exiled" }, play: true, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: "Whenever this creature attacks, exile the top card of your library. You may get {E}{E} (two energy counters). If you don't, you may play that card this turn.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 3 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "{T}, Pay {E}{E}{E}: This creature deals 3 damage to any target.",
    },
  ],
});
