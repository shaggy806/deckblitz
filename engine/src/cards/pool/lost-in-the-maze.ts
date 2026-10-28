import { defineCard } from "../define.js";

// Its enters ability reads the X it was cast with (rule 107.3m), so its
// group is exactly that many: Word of Binding's shape, on a trigger. The stun
// counters go only on the targets you don't control.
const TRIGGER_TEXT =
  "When this enchantment enters, tap X target creatures. Put a stun counter on each of those creatures you don't control. (If a permanent with a stun counter would become untapped, remove one from it instead.)";

export default defineCard({
  name: "Lost in the Maze",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  keywords: ["flash"],
  text: `Flash\n${TRIGGER_TEXT}\nTapped creatures you control have hexproof.`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", min: "x", max: "x" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
          {
            kind: "for-each-target",
            from: 0,
            effect: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { controlledBy: "opponent" } },
              then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", tapped: true } },
      grantKeywords: ["hexproof"],
      text: "Tapped creatures you control have hexproof.",
    },
  ],
});
