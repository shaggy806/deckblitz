import { defineCard } from "../define.js";

const DRAW_TEXT = "Whenever you attack a player with one or more creatures with power 4 or greater, draw a card.";
const EXHAUST_TEXT = "Exhaust — {4}: Earthbend 4. Activate only during your turn.";

export default defineCard({
  name: "Bitter Work",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["enchantment"],
  text: `${DRAW_TEXT}\n${EXHAUST_TEXT} (Target land you control becomes a 0/0 creature with haste that's still a land. Put four +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped. Activate each exhaust ability only once.)`,
  triggered: [
    {
      trigger: {
        on: "attacks-player",
        who: "you",
        defender: "any",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["land-you-control"],
      effect: { kind: "earthbend", target: 0, amount: 4 },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
      condition: { kind: "your-turn" },
    },
  ],
});
