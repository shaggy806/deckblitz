import { defineCard } from "../define.js";

// EDHREC rank 18996. Khans of Tarkir.
//
// The target is chosen as the ability goes on the stack; whether to pay {1}
// is decided as it resolves (the ruling).

const TRIGGER_TEXT =
  "Whenever you cast a noncreature spell, you may pay {1}. If you do, tap target creature an opponent controls and it doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Quiet Contemplation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "may",
        prompt: "Pay {1} to tap target creature an opponent controls? It doesn't untap during its controller's next untap step.",
        cost: "{1}",
        effect: { kind: "tap", target: 0, doesntUntapNext: true },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
