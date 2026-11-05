import { defineCard } from "../define.js";

const GAIN = "Whenever this creature deals combat damage, you gain 3 life.";
const TEXT = `As long as you have more cards in hand than each opponent, this creature gets +1/+2 and has "${GAIN}"`;

export default defineCard({
  name: "Descendant of Kiyomaro",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      grantPt: [1, 2],
      // With no recipient named, once per simultaneous damage event, however
      // many creatures it was dealt to (rule 603.2c).
      grantsTriggered: [
        {
          trigger: { on: "deals-damage", who: "self", combat: true },
          targets: [],
          effect: { kind: "gain-life", amount: 3 },
          resolve: null,
          text: GAIN,
        },
      ],
      text: TEXT,
    },
  ],
});
