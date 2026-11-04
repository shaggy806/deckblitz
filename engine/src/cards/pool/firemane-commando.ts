import { defineCard } from "../define.js";

// "They draw a card if none of those creatures attacked you": asked as it
// resolves, of that declaration and not the turn (an earlier combat's attack
// on you doesn't count), each attacker as it was declared if it's gone. Not an
// intervening if: it says nothing right after the trigger's event.

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
        condition: { kind: "not", of: { kind: "those-attackers-at-you" } },
        then: { kind: "draw", amount: 1, who: "trigger-player" },
      },
      resolve: null,
      text: "Whenever another player attacks with two or more creatures, they draw a card if none of those creatures attacked you.",
    },
  ],
});
