import { defineCard } from "../define.js";

export default defineCard({
  name: "Hellhole Flailer",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["unleash"],
  text: "Unleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)\n{2}{B}{R}, Sacrifice this creature: It deals damage equal to its power to target player or planeswalker.",
  activated: [
    {
      cost: { mana: "{2}{B}{R}", tap: false, sacrifice: "self" },
      targets: ["player-or-planeswalker"],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
      resolve: null,
      text: "{2}{B}{R}, Sacrifice this creature: It deals damage equal to its power to target player or planeswalker.",
    },
  ],
});
