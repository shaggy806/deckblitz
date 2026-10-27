import { defineCard } from "../define.js";

// EDHREC rank 25092.
//
// Rulings:
//   Stampede Driver's ability affects only creatures you control at the time it resolves.

const TEXT = "{1}{G}, {T}, Discard a card: Creatures you control get +1/+1 and gain trample until end of turn.";

export default defineCard({
  name: "Stampede Driver",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
