import { defineCard } from "../define.js";

// EDHREC rank 10913.
//
// Rulings:
//   [2021-06-18] If this creature gets enough -1/-1 counters put on it to cause it to go to the
//     graveyard, modular will put a number of +1/+1 counters on the target artifact creature equal
//     to the number of +1/+1 counters on this creature before it left the battlefield.
//   [2021-06-18] If this creature gets enough -1/-1 counters put on it to cause it to go to the
//     graveyard, modular will put a number of +1/+1 counters on the target artifact creature equal
//     to the number of +1/+1 counters on this creature before it left the battlefield.
//   [2021-06-18] If the target is illegal as the activated ability tries to resolve, perhaps
//     because it was removed from combat, no damage will be dealt.

export default defineCard({
  name: "Arcbound Javelineer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Soldier"],
  power: 0,
  toughness: 1,
  text: "{T}, Remove X +1/+1 counters from this creature: It deals X damage to target attacking or blocking creature.\nModular 1 (This creature enters with a +1/+1 counter on it. When it dies, you may put its +1/+1 counters on target artifact creature.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "permanent", filter: { types: ["artifact", "creature"] } }],
      effect: {
        kind: "may",
        prompt: "Put this creature's +1/+1 counters on target artifact creature?",
        effect: {
          kind: "add-counter",
          target: 0,
          counter: "+1/+1",
          amount: { countersOn: "source", counter: "+1/+1" },
        },
      },
      resolve: null,
      text: "Modular 1",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 1 } },
      text: "Modular 1",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "+1/+1", count: "x" } },
      targets: ["attacking-or-blocking-creature"],
      effect: { kind: "damage", amount: "x", target: 0 },
      resolve: null,
      text: "{T}, Remove X +1/+1 counters from this creature: It deals X damage to target attacking or blocking creature.",
    },
  ],
});
