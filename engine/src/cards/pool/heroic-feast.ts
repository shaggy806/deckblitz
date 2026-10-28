import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever you gain life, choose up to that many target creatures you control. Put a +1/+1 counter on each of them.";

// "That many" is the life gained (the trigger value), read as the ability is
// put on the stack: that's how many targets it may have.
export default defineCard({
  name: "Heroic Feast",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `When this enchantment enters, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: `When this enchantment enters, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")`,
    },
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [{ kind: "any-number", of: "creature-you-control", max: { triggerValue: true } }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
