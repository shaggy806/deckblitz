import { defineCard } from "../define.js";

const COUNTER_MODE = "Counter target noncreature spell unless its controller pays {2}.";
const BOUNCE_MODE = "Return target creature with mana value 2 or less to its owner's hand.";
const UNBLOCKABLE_MODE = "Target creature can't be blocked this turn.";
const LOOT_MODE = "Target player draws two cards, then discards two cards.";

export default defineCard({
  name: "Wesley Crusher, Starfleet Cadet",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\nWhen Wesley Crusher enters, choose two —\n• ${COUNTER_MODE}\n• ${BOUNCE_MODE}\n• ${UNBLOCKABLE_MODE}\n• ${LOOT_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 2,
        maxModes: 2,
        modes: [
          {
            text: COUNTER_MODE,
            targets: ["noncreature-spell"],
            effect: { kind: "unless", chooser: 0, options: [{ pay: "{2}", text: "Pay {2}" }], otherwise: { kind: "counter", target: 0 } },
          },
          {
            text: BOUNCE_MODE,
            targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: 2 } } }],
            effect: { kind: "return-to-hand", target: 0 },
          },
          {
            text: UNBLOCKABLE_MODE,
            targets: ["creature"],
            effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
          },
          {
            text: LOOT_MODE,
            targets: ["player"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "draw", amount: 2, target: 0 },
                { kind: "discard", target: 0, amount: 2 },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: "When Wesley Crusher enters, choose two —",
    },
  ],
});
