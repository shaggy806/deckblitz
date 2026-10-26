import { defineCard } from "../define.js";

// EDHREC rank 18134.
//
// Rulings:
//   [2006-02-01] The creature you put onto the battlefield from your graveyard is attacking, even
//     if the attack couldn't legally be declared (for example, if that creature has defender or an
//     effect says that no more than one creature can attack).
//   [2006-02-01] Putting an attacking creature onto the battlefield doesn't trigger "When this
//     creature attacks" abilities. It also won't check attacking restrictions, costs, or
//     requirements.
//   [2006-02-01] In a multiplayer game in which you're allowed to attack only one player each
//     combat, the new creature will be attacking the same player as Yore-Tiller Nephilim. In a
//     multiplayer game in which you may attack multiple players, you choose the player the new
//     creature is attacking. It must be a player you're allowed to attack.
const TEXT =
  "Whenever this creature attacks, return target creature card from your graveyard to the battlefield tapped and attacking.";

export default defineCard({
  name: "Yore-Tiller Nephilim",
  manaCost: "{W}{U}{B}{R}",
  colors: ["W", "U", "B", "R"],
  types: ["creature"],
  subtypes: ["Nephilim"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true, attacking: "choose" },
      resolve: null,
      text: TEXT,
    },
  ],
});
