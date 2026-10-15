import { defineCard } from "../define.js";

// EDHREC rank 21689.
// Battalion as Sokka, Lateral Strategist's "and at least one other creature
// attack": part of the trigger condition, judged as attackers are declared —
// Falcon and two more among them (three attacking creatures).

const TEXT =
  "Battalion — Whenever Falcon and at least two other creatures attack, put a +1/+1 counter on him and scry 1.";

export default defineCard({
  name: "Falcon, Joaquin Torres",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${TEXT} (Look at the top card of your library. You may put that card on the bottom.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "controls",
        filter: { type: "creature", attacking: true },
        atLeast: 3,
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "scry", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
