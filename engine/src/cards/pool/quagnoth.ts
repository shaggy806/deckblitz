import { defineCard } from "../define.js";

const DISCARDED =
  "When a spell or ability an opponent controls causes you to discard this card, return it to your hand.";

// Triggers from wherever the discard put it, its graveyard or exile under a
// Leyline of the Void, and does nothing once it has moved on (the rulings).
export default defineCard({
  name: "Quagnoth",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 5,
  keywords: ["shroud"],
  splitSecond: true,
  text: `Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nShroud (This creature can't be the target of spells or abilities.)\n${DISCARDED}`,
  triggered: [
    {
      trigger: { on: "this-discarded", byOpponent: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "where-discarded" },
      resolve: null,
      text: DISCARDED,
    },
  ],
});
