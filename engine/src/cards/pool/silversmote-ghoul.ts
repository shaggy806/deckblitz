import { defineCard } from "../define.js";

// Rulings:
//   [2020-06-23] Silversmote Ghoul's first ability looks at how much life you've gained in the
//     turn, even if it wasn't on the battlefield or in your graveyard when you gained life. It
//     doesn't care if you also lost life.
//   [2020-06-23] If Silversmote Ghoul isn't in your graveyard as your end step begins, its first
//     ability won't trigger at all.

export default defineCard({
  name: "Silversmote Ghoul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Vampire"],
  power: 3,
  toughness: 1,
  text: "At the beginning of your end step, if you gained 3 or more life this turn, return this card from your graveyard to the battlefield tapped.\n{1}{B}, Sacrifice this creature: Draw a card.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{1}{B}, Sacrifice this creature: Draw a card.",
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 3 },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: "At the beginning of your end step, if you gained 3 or more life this turn, return this card from your graveyard to the battlefield tapped.",
    },
  ],
});
