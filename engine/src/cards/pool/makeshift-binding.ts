import { defineCard } from "../define.js";

const TEXT =
  "When this enchantment enters, exile target creature an opponent controls until this enchantment leaves the battlefield. You gain 2 life.";

export default defineCard({
  name: "Makeshift Binding",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      // Gone before this resolves, nothing is exiled but the life is still
      // gained (the ruling); an illegal target stops the whole ability.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0, untilSourceLeaves: true },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
