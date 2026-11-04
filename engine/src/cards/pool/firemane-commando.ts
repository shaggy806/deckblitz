import { defineCard } from "../define.js";

// "They draw a card if none of those creatures attacked you": asked as it
// resolves, of those creatures (`in: "attackers"`), as they were then if they've
// gone. Not an intervening if: it says nothing right after the trigger's event.

export default defineCard({
  name: "Firemane Commando",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Soldier"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever you attack with two or more creatures, draw a card.\nWhenever another player attacks with two or more creatures, they draw a card if none of those creatures attacked you.",
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you attack with two or more creatures, draw a card.",
    },
    {
      trigger: { on: "attack-with", who: "opponent", atLeast: 2 },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "aggregate",
          value: { aggregate: "count", in: "attackers", filter: { attackedYouThisTurn: true } },
          compare: { op: "eq", n: 0 },
        },
        then: { kind: "draw", amount: 1, who: "trigger-player" },
      },
      resolve: null,
      text: "Whenever another player attacks with two or more creatures, they draw a card if none of those creatures attacked you.",
    },
  ],
});
