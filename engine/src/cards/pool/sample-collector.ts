import { defineCard } from "../define.js";

// EDHREC rank 29813.
//
// "You may collect evidence 3. When you do, …" — the `collect-evidence`
// effect (declinable), whose `then` runs only once evidence was collected; it
// is a reflexive triggered ability (rule 603.12) that chooses its target as
// it goes on the stack, and players may respond to it (the ruling).

const ATTACK_TEXT =
  "Whenever this creature attacks, you may collect evidence 3. When you do, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Sample Collector",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Detective"],
  power: 2,
  toughness: 3,
  text: `${ATTACK_TEXT} (To collect evidence 3, exile cards with total mana value 3 or greater from your graveyard.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "collect-evidence",
        amount: 3,
        then: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          text: "When you do, put a +1/+1 counter on target creature you control.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
