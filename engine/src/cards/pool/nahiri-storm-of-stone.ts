import { defineCard } from "../define.js";

// EDHREC rank 17843. One sentence, two statics, each only during your turn.

const STATIC_TEXT = "During your turn, creatures you control have first strike and equip abilities you activate cost {1} less to activate.";

export default defineCard({
  name: "Nahiri, Storm of Stone",
  manaCost: "{2}{R/W}{R/W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nahiri"],
  loyalty: 6,
  text: `${STATIC_TEXT}\n−X: Nahiri deals X damage to target tapped creature.`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: STATIC_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, reduceGeneric: 1 },
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "−X: Nahiri deals X damage to target tapped creature.",
    },
  ],
});
