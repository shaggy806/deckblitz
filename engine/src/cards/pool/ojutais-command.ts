import { defineCard } from "../define.js";

export default defineCard({
  name: "Ojutai's Command",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["instant"],
  text:
    "Choose two —\n" +
    "• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n" +
    "• You gain 4 life.\n" +
    "• Counter target creature spell.\n" +
    "• Draw a card.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Return target creature card with mana value 2 or less from your graveyard to the battlefield.",
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { type: "creature", manaValue: { op: "lte", n: 2 } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      {
        text: "You gain 4 life.",
        targets: [],
        effect: { kind: "gain-life", amount: 4 },
      },
      {
        text: "Counter target creature spell.",
        targets: ["creature-spell"],
        effect: { kind: "counter", target: 0 },
      },
      {
        text: "Draw a card.",
        targets: [],
        effect: { kind: "draw", amount: 1 },
      },
    ],
  },
});
