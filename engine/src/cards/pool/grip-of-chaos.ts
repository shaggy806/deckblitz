import { defineCard } from "../define.js";

// Scourge. EDHREC rank 11094.
//
// Every spell or ability put onto the stack — cast, activated, triggered or
// copied, anyone's (rules 405.1, 707.10) — with a single target (115.9a: one
// chosen as it went there) triggers it; its own trigger has none, so it never
// triggers itself. The target is drawn when this resolves, from every legal
// target for it then, the current one included; with none, it keeps its
// target (the rulings).
const TEXT =
  "Whenever a spell or ability is put onto the stack, if it has a single target, reselect its target at random. (Select from among all legal targets.)";

export default defineCard({
  name: "Grip of Chaos",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "event", event: "put-on-stack" },
      condition: { kind: "trigger-object", filter: { stackObjectTargets: { count: 1 } } },
      targets: [],
      effect: { kind: "change-targets", target: "trigger-object", how: "random" },
      resolve: null,
      text: TEXT,
    },
  ],
});
