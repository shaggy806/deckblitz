import { defineCard } from "../define.js";

// EDHREC rank 18759.
//
// Rulings:
//   [2023-11-10] Tendril of the Mycotyrant's ability doesn't have a duration. The land remains a
//     creature until it leaves the battlefield.

export default defineCard({
  name: "Tendril of the Mycotyrant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Fungus", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{5}{G}{G}: Put seven +1/+1 counters on target noncreature land you control. It becomes a 0/0 Fungus creature with haste. It's still a land.",
  activated: [
    {
      cost: { mana: "{5}{G}{G}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "land", notTypes: ["creature"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 7 },
          {
            kind: "animate",
            target: 0,
            power: 0,
            toughness: 0,
            addTypes: ["creature"],
            addSubtypes: ["Fungus"],
            keywords: ["haste"],
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: "{5}{G}{G}: Put seven +1/+1 counters on target noncreature land you control. It becomes a 0/0 Fungus creature with haste. It's still a land.",
    },
  ],
});
