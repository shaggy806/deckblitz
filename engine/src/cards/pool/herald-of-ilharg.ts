import { defineCard } from "../define.js";

// EDHREC rank 11665. Ravnica: Clue Edition (CLU).
//
// It resolves before the spell, and even if the spell is countered (the
// ruling): "that spell's mana value" is the spell's on the stack, or as it
// last was there. The damage is every counter on it, of any kind — as it last
// existed on the battlefield if it has left (the ruling).
const TEXT =
  "Whenever you cast a creature spell, put two +1/+1 counters on this creature. If that spell has mana value 5 or greater, this creature deals damage equal to the number of counters on it to each opponent.";

export default defineCard({
  name: "Herald of Ilharg",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Boar", "Beast"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "trigger-object", filter: { manaValue: { op: "gte", n: 5 } } },
            then: { kind: "damage", amount: { countersOn: "source" }, who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
