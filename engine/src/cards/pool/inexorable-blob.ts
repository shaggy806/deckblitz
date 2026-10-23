import { defineCard } from "../define.js";

// EDHREC rank 15827.
//
// Rulings:
//   [2016-04-08] Most triggered delirium abilities use an intervening "if" clause. There must be
//     four or more card types among cards in your graveyard in order for these abilities to
//     trigger, otherwise they never trigger at all. The number of card types is checked again as
//     the trigger resolves, and if it has become too low somehow, the ability does nothing.
//   [2016-04-08] Although the token is attacking, it was never declared as an attacking creature
//     (for purposes of abilities that trigger whenever a creature attacks, for example).
//   [2016-04-08] You declare which player or planeswalker the token is attacking as you put it
//     onto the battlefield. It doesn't have to be the same player or planeswalker Inexorable Blob
//     is attacking.
//   [2016-04-08] If an effect gives the token vigilance, the token will still enter the
//     battlefield tapped.
// `attacking: "choose"` asks which player or planeswalker the token attacks
// (rule 508.4), as Hero of Bladehold's Soldiers do.

const TEXT =
  "Delirium — Whenever this creature attacks, if there are four or more card types among cards in your graveyard, create a 3/3 green Ooze creature token that's tapped and attacking.";

export default defineCard({
  name: "Inexorable Blob",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Ooze Token", count: 1, tapped: true, attacking: "choose" },
      resolve: null,
      text: TEXT,
    },
  ],
});
