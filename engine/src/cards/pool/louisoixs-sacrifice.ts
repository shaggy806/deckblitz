import { defineCard } from "../define.js";

export default defineCard({
  name: "Louisoix's Sacrifice",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "As an additional cost to cast this spell, sacrifice a legendary creature or pay {2}.\nCounter target activated ability, triggered ability, or noncreature spell.",
  additionalCost: {
    options: [
      { text: "Sacrifice a legendary creature", sacrifice: { type: "creature", supertype: "legendary", controlledBy: "you" } },
      { text: "Pay {2}", mana: "{2}" },
    ],
  },
  targets: [
    {
      kind: "one-of",
      of: [{ kind: "ability" }, { kind: "spell", filter: { notTypes: ["creature"] } }],
    },
  ],
  effect: { kind: "counter", target: 0 },
});
