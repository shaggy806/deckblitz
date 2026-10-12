import { defineCard } from "../define.js";

// EDHREC rank 10305.
//
// The attack/block restriction reads its own power as attackers or blockers
// are declared; once it's attacking or blocking, lowering its power doesn't
// remove it from combat (its ruling).
const RESTRICTION = "This creature can't attack or block unless its power is 6 or greater.";
const SAC = "{T}, Sacrifice another artifact: Draw a card. Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Technodrome",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 3,
  toughness: 3,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${RESTRICTION}\n${SAC}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "source", filter: { power: { op: "gte", n: 6 } } } },
      restrictions: ["cant-attack", "cant-block"],
      text: RESTRICTION,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: SAC,
    },
  ],
});
