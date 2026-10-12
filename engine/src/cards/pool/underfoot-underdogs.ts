import { defineCard } from "../define.js";

export default defineCard({
  name: "Underfoot Underdogs",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 2,
  text: "When this creature enters, create a 1/1 red Goblin creature token.\n{1}, {T}: Target creature you control with power 2 or less can't be blocked this turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [
        {
          kind: "permanent",
          whose: "you",
          filter: { type: "creature", power: { op: "lte", n: 2 } },
        },
      ],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: "{1}, {T}: Target creature you control with power 2 or less can't be blocked this turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 red Goblin creature token.",
    },
  ],
});
