import { defineCard } from "../define.js";

// Rulings:
//   The creature having a +1/+1 counter on it is part of the targeting requirement of Ollenbock
//   Escort's ability. After the ability has resolved, the creature won't lose lifelink or
//   indestructible if the counter goes away.

const SAC_TEXT =
  "Sacrifice this creature: Target creature you control with a +1/+1 counter on it gains lifelink and indestructible until end of turn.";

export default defineCard({
  name: "Ollenbock Escort",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
