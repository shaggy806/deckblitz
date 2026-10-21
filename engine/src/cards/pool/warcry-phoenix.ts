import { defineCard } from "../define.js";

// EDHREC rank 17696. Dominaria.
//
// Rulings:
//   [2018-04-27] If Warcry Phoenix enters the battlefield attacking, it wasn't declared as an
//     attacking creature that turn. Abilities that trigger when a creature attacks won't trigger.
//   [2018-04-27] As Warcry Phoenix returns to the battlefield because of its triggered ability,
//     you choose which opponent or opposing planeswalker it's attacking.
//
// Interceptor, Shadow's Hound's graveyard return, on an attack of three or
// more creatures.

const TEXT =
  "Whenever you attack with three or more creatures, you may pay {2}{R}. If you do, return this card from your graveyard to the battlefield tapped and attacking.";

export default defineCard({
  name: "Warcry Phoenix",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phoenix"],
  power: 2,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "attack-with", who: "you", atLeast: 3, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{R} to return Warcry Phoenix tapped and attacking?",
        cost: "{2}{R}",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
