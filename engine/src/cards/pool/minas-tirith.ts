import { defineCard } from "../define.js";
import { manaTapAbility } from "../helpers.js";

export default defineCard({
  name: "Minas Tirith",
  colors: [],
  types: ["land"],
  supertypes: ["legendary"],
  text: "Minas Tirith enters tapped unless you control a legendary creature.\n{T}: Add {W}.\n{1}{W}, {T}: Draw a card. Activate only if you attacked with two or more creatures this turn.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: {
          kind: "controls",
          filter: { type: "creature", supertype: "legendary" },
          atLeast: 1,
        },
      },
      text: "Minas Tirith enters tapped unless you control a legendary creature.",
    },
  ],
  activated: [
    manaTapAbility("W"),
    {
      cost: { mana: "{1}{W}", tap: true },
      condition: { kind: "turn-stat", stat: "attackers", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{W}, {T}: Draw a card. Activate only if you attacked with two or more creatures this turn.",
    },
  ],
});
