import { defineCard } from "../define.js";

// EDHREC rank 5091.
//
// Rulings:
//   Auras attached to the exiled creature are put into their owners'
//     graveyards; Equipment stays on the battlefield; its counters cease to
//     exist. It returns as a new object.
//   Once a creature is exiled, Auron's power doesn't matter: reducing it
//     below the exiled creature's power won't return that creature.
//   The target is chosen as the reflexive ability goes on the stack, after
//     the counter is put — so against Auron's power with that counter.
//   A token exiled this way ceases to exist and won't return.
//
// "When you do" (rule 603.12): only if the counter was put. The reflexive
// ability's target filter reads Auron's power as the ability triggers and
// again as it resolves (rule 608.2b), not as the attack trigger began.

const SHOOTING_STAR =
  "Exile target creature defending player controls with power less than Auron's power until Auron leaves the battlefield.";

export default defineCard({
  name: "Auron, Venerated Guardian",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Spirit", "Samurai"],
  power: 2,
  toughness: 5,
  keywords: ["vigilance"],
  text:
    "Vigilance\n" +
    "Shooting Star — Whenever Auron attacks, put a +1/+1 counter on it. When you do, exile target creature defending player controls with power less than Auron's power until Auron leaves the battlefield.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "counters-put" },
            then: {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "permanent",
                  whose: "defending-player",
                  filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
                },
              ],
              effect: { kind: "exile", target: 0, untilSourceLeaves: true },
              text: SHOOTING_STAR,
            },
          },
        ],
      },
      resolve: null,
      text: "Shooting Star — Whenever Auron attacks, put a +1/+1 counter on it. When you do, exile target creature defending player controls with power less than Auron's power until Auron leaves the battlefield.",
    },
  ],
});
