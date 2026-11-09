import { defineCard } from "../define.js";

const GRANTED =
  "Whenever this creature becomes tapped during your turn, untap it and put a +1/+1 counter on it. This ability triggers only once each turn.";

export default defineCard({
  name: "Dionus, Elvish Archdruid",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Druid"],
  power: 3,
  toughness: 3,
  text: `Elves you control have "${GRANTED}"`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Elf", controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "becomes-tapped", who: "self" },
          condition: { kind: "your-turn" },
          oncePerTurn: true,
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "untap", target: "source" },
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Elves you control have "${GRANTED}"`,
    },
  ],
});
