import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may put three +1/+1 counters on target land you control. If you do, that land becomes a 0/0 Elemental creature with haste that's still a land.";

export default defineCard({
  name: "Wall of Resurgence",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 6,
  keywords: ["defender"],
  text: `Defender\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt: "Put three +1/+1 counters on that land and make it a 0/0 Elemental creature with haste?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
            {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              keywords: ["haste"],
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
