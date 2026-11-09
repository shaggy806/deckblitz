import { defineCard } from "../define.js";

const TEXT = "If you would lose the game, instead exile this creature and your life total becomes equal to your starting life total.";

export default defineCard({
  name: "Exquisite Archangel",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-lose-game",
        who: "you",
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "exile", target: "source" },
              { kind: "set-life-total", who: "you", amount: { startingLifeTotal: true } },
            ],
          },
        },
      },
      text: TEXT,
    },
  ],
});
