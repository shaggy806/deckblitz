import { defineCard } from "../define.js";

// EDHREC rank 15285.
//
// Rulings:
//   If at least one target is still legal as it tries to resolve, it will resolve and do as
//   much as it can. If all its targets are illegal, it will do nothing.

export default defineCard({
  name: "Silverquill Command",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text:
    "Choose two —\n" +
    "• Target creature gets +3/+3 and gains flying until end of turn.\n" +
    "• Return target creature card with mana value 2 or less from your graveyard to the battlefield.\n" +
    "• Target player draws a card and loses 1 life.\n" +
    "• Target opponent sacrifices a creature of their choice.",
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: "Target creature gets +3/+3 and gains flying until end of turn.",
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          ],
        },
      },
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
        text: "Target player draws a card and loses 1 life.",
        targets: ["player"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1, target: 0 },
            { kind: "lose-life", amount: 1, target: 0 },
          ],
        },
      },
      {
        text: "Target opponent sacrifices a creature of their choice.",
        targets: ["opponent"],
        effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      },
    ],
  },
});
