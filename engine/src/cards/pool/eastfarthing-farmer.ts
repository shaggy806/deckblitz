import { defineCard } from "../define.js";

// EDHREC rank 12958.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2023-06-16] You don't choose a target for Eastfarthing Farmer's ability at the time it
//     triggers. Rather, a second "reflexive" ability triggers when you create a Food token this
//     way. You choose a target for that ability as it goes on the stack. Each player may respond
//     to this triggered ability as normal.

const TEXT =
  "When this creature enters, create a Food token. When you do, target creature you control gets +1/+1 until end of turn for each Food you control.";
// Counted as the reflexive ability resolves.
const FOODS = { countOf: { subtype: "Food", controlledBy: "you" } } as const;

export default defineCard({
  name: "Eastfarthing Farmer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Halfling", "Peasant"],
  power: 2,
  toughness: 3,
  text: `${TEXT} (A Food token is an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Food Token", count: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "created", filter: { subtype: "Food" } },
            then: {
              kind: "reflexive-trigger",
              targets: ["creature-you-control"],
              effect: { kind: "modify-pt", target: 0, power: FOODS, toughness: FOODS, duration: "end-of-turn" },
              text: "When you do, target creature you control gets +1/+1 until end of turn for each Food you control.",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
