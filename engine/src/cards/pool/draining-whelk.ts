import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, counter target spell. Put X +1/+1 counters on this creature, where X is that spell's mana value.";

export default defineCard({
  name: "Draining Whelk",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 1,
  toughness: 1,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["spell"],
      // The countered spell's mana value is read as it last was on the stack,
      // its {X} included (the ruling); an uncounterable spell still counts.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counter", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: { manaValueOf: 0 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
