import { defineCard } from "../define.js";

// EDHREC rank 18785.

export default defineCard({
  name: "Vito's Inquisitor",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 3,
  text: "{B}, Sacrifice another creature or artifact: Put a +1/+1 counter on this creature. It gains menace until end of turn.",
  activated: [
    {
      cost: {
        mana: "{B}",
        tap: false,
        sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "{B}, Sacrifice another creature or artifact: Put a +1/+1 counter on this creature. It gains menace until end of turn.",
      otherOnly: true,
    },
  ],
});
