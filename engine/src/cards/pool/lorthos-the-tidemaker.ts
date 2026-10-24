import { defineCard } from "../define.js";

const TEXT =
  "Whenever Lorthos attacks, you may pay {8}. If you do, tap up to eight target permanents. Those permanents don't untap during their controllers' next untap steps.";

// The targets are chosen as the trigger goes on the stack and the {8} is
// paid as it resolves. "Doesn't untap during its controller's next untap
// step" is whoever controls it then (the ruling: a permanent that changes
// controllers skips its new controller's next untap step).
export default defineCard({
  name: "Lorthos, the Tidemaker",
  manaCost: "{5}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Octopus"],
  power: 8,
  toughness: 8,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "any-number", of: "permanent", min: 0, max: 8 }],
      effect: {
        kind: "may",
        prompt: "Pay {8} to tap up to eight target permanents?",
        cost: "{8}",
        effect: {
          kind: "for-each-target",
          from: 0,
          effect: { kind: "tap", target: 0, doesntUntapNext: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
