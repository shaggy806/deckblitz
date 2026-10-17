import { defineCard } from "../define.js";

// EDHREC rank 12333.

export default defineCard({
  name: "Eagle of Deliverance",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, put an indestructible counter on another target creature you control. Draw a card if that creature's power is 2 or less.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      // Its power as the ability resolves, after the counter goes on.
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "indestructible", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { power: { op: "lte", n: 2 } } },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, put an indestructible counter on another target creature you control. Draw a card if that creature's power is 2 or less.",
    },
  ],
});
