import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 19856. Murasa Ranger's "you may pay … If you do" shape.

const TRIGGER_TEXT =
  "Whenever Vorosh deals combat damage to a player, you may pay {2}{G}. If you do, put six +1/+1 counters on Vorosh.";

export default defineCard({
  name: "Vorosh, the Hunter",
  manaCost: "{3}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{G} to put six +1/+1 counters on Vorosh?",
        cost: "{2}{G}",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 6 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
