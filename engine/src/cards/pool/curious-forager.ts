import { defineCard } from "../define.js";
import { forageOptions } from "../helpers.js";

// Rulings:
//   [2024-07-26] You don't choose a target for Curious Forager's ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when you forage this way. You choose a target
//     for this ability as it goes on the stack.
//   [2024-07-26] If you don't have enough cards in your graveyard or a Food on the battlefield,
//     you can't choose to forage.

const ENTER_TEXT =
  "When this creature enters, you may forage. When you do, return target permanent card from your graveyard to your hand.";

export default defineCard({
  name: "Curious Forager",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Druid"],
  power: 3,
  toughness: 2,
  text: `${ENTER_TEXT} (To forage, exile three cards from your graveyard or sacrifice a Food.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: forageOptions(),
        ifDid: {
          kind: "reflexive-trigger",
          targets: [{ kind: "card-in-graveyard", whose: "you", filter: { notTypes: ["instant", "sorcery"] } }],
          effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          text: "When you do, return target permanent card from your graveyard to your hand.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
