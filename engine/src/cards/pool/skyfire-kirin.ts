import { defineCard } from "../define.js";

// Saviors of Kamigawa. The target's mana value is compared with the trigger
// object's (Clement, the Worrywort's dynamic compare), X included as it was on
// the stack (its ruling).
const TEXT =
  "Whenever you cast a Spirit or Arcane spell, you may gain control of target creature with that spell's mana value until end of turn.";

export default defineCard({
  name: "Skyfire Kirin",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kirin", "Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtypes: ["Spirit", "Arcane"] } },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", manaValue: { op: "eq", n: { amount: { manaValueOf: "trigger-object" } } } },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Gain control of the target creature until end of turn?",
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
