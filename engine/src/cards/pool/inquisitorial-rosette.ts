import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7020.
// Makes Astartes Warrior → use "Astartes Warrior Token".
//
// Rulings:
//   [2022-10-07] Although the tokens enter the battlefield attacking, they were never declared as
//     attacking creatures. Abilities that trigger whenever a creature attacks won't trigger.
//   [2022-10-07] For the triggered ability, you declare which player or planeswalker the token is
//     attacking as you put it onto the battlefield. It doesn't have to be the same player or
//     planeswalker the equipped creature is attacking.

const AGENTS =
  "Inquisition Agents — Whenever equipped creature attacks, create a 2/2 white Astartes Warrior creature token with vigilance that's attacking. Then attacking creatures gain menace until end of turn.";

export default defineCard({
  name: "Inquisitorial Rosette",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${AGENTS}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          // Untapped ("that's attacking", not "tapped and attacking"); its
          // controller picks what it attacks, which needn't be what the
          // equipped creature attacks, and it was never declared (the rulings).
          { kind: "create-token", token: "Astartes Warrior Token", count: 1, attacking: "choose" },
          // Every attacking creature as this resolves, the new token included.
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", attacking: true },
            keyword: "menace",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: AGENTS,
    },
  ],
  activated: [equip("{3}")],
});
