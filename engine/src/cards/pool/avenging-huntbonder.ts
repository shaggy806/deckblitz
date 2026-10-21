import { defineCard } from "../define.js";

// Commander 2020.

const ATTACKS = "Whenever this creature attacks, put a double strike counter on another target attacking creature.";

export default defineCard({
  name: "Avenging Huntbonder",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["double-strike"],
  text: `Double strike\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } } }],
      effect: { kind: "add-counter", target: 0, counter: "double-strike", amount: 1 },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
