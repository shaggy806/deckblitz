import { defineCard } from "../define.js";

// EDHREC rank 17487.

const ENTERS =
  "When this creature enters, tap up to one target creature. If an opponent controls that creature, put a stun counter on it.";

export default defineCard({
  name: "Fear of Immobility",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 4,
  toughness: 4,
  text: `${ENTERS} (If a permanent with a stun counter would become untapped, remove one from it instead.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            // Who controls it as this resolves.
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { controlledBy: "opponent" } },
            then: { kind: "add-counter", target: 0, counter: "stun", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
