import { defineCard } from "../define.js";

// Aetherdrift (DFT). "Haven't activated an exhaust ability this turn" means
// haven't begun to activate one (rule 702.177b): the first exhaust ability
// activated each of your turns may be one already used, and none after it.

const REFUEL =
  "During your turn, as long as you haven't activated an exhaust ability this turn, you may activate exhaust abilities as though they haven't been activated.";
const EXHAUST = "Exhaust — {1}{G}: Put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Elvish Refueler",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 2,
  toughness: 3,
  text: `${REFUEL}\n${EXHAUST} (Activate each exhaust ability only once.)`,
  static: [
    {
      affects: { scope: "self" },
      exhaustReactivation: true,
      text: REFUEL,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: EXHAUST,
      exhaust: true,
    },
  ],
});
