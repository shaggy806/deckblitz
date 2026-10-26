import { defineCard } from "../define.js";
import { BEFORE_ATTACKERS_DECLARED } from "../helpers.js";

// Portal Three Kingdoms (PTK). EDHREC rank 9995. Talas Researcher's timing.
//
// Rulings:
//   [2013-09-20] If a turn has multiple combat phases, the ability can only be activated before
//     the beginning of the declare attackers step of the first combat phase in that turn.

const TEXT =
  "Sacrifice this creature: Return target legendary creature card from your graveyard to the battlefield. Activate only during your turn, before attackers are declared.";

export default defineCard({
  name: "Loyal Retainers",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Advisor"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { supertype: "legendary", type: "creature" },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      condition: BEFORE_ATTACKERS_DECLARED,
      resolve: null,
      text: TEXT,
    },
  ],
});
