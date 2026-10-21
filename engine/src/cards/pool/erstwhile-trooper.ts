import { defineCard } from "../define.js";

// EDHREC rank 29306.

export default defineCard({
  name: "Erstwhile Trooper",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Discard a creature card: This creature gets +2/+2 and gains trample until end of turn. Activate only once each turn.",
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Discard a creature card: This creature gets +2/+2 and gains trample until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
