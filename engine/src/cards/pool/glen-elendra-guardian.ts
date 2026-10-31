import { defineCard } from "../define.js";

// EDHREC rank 5724.

export default defineCard({
  name: "Glen Elendra Guardian",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Wizard"],
  power: 3,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: "Flash\nFlying\nThis creature enters with a -1/-1 counter on it.\n{1}{U}, Remove a counter from this creature: Counter target noncreature spell. Its controller draws a card.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 1 } },
      text: "This creature enters with a -1/-1 counter on it.",
    },
  ],
  activated: [
    {
      // A counter of any kind it has, chosen as the cost is paid (rule 602.2b).
      cost: { mana: "{1}{U}", tap: false, removeCounter: { kind: "any", count: 1 } },
      targets: ["noncreature-spell"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "counter", target: 0 },
          { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
        ],
      },
      resolve: null,
      text: "{1}{U}, Remove a counter from this creature: Counter target noncreature spell. Its controller draws a card.",
    },
  ],
});
