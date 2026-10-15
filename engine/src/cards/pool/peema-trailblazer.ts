import { defineCard } from "../define.js";

// EDHREC rank 9666.

const COMBAT_TEXT = "Whenever this creature deals combat damage to a player, you get that many {E} (energy counters).";
const EXHAUST_TEXT =
  "Exhaust — Pay six {E}: Put two +1/+1 counters on this creature. Then draw cards equal to the greatest power among creatures you control. (Activate each exhaust ability only once.)";

export default defineCard({
  name: "Peema Trailblazer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${COMBAT_TEXT}\n${EXHAUST_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: { triggerValue: true } },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 6 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          // Read after the counters are on (the "Then"), so they count.
          { kind: "draw", amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: "Exhaust — Pay six {E}: Put two +1/+1 counters on this creature. Then draw cards equal to the greatest power among creatures you control.",
      exhaust: true,
    },
  ],
});
