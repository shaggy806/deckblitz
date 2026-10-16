import { defineCard } from "../define.js";
import { forageOptions, offspringTrigger } from "../helpers.js";

// Rulings:
//   [2024-07-26] If you don't have enough cards in your graveyard or a Food on the battlefield,
//     you can't choose to forage.
//   [2024-07-26] You decide whether to forage or not as Bushy Bodyguard's last ability resolves.
//   [2024-07-26] Any "enters" abilities of the copied creature will trigger when the token enters.

const ENTER_TEXT = "When this creature enters, you may forage. If you do, put two +1/+1 counters on it.";

export default defineCard({
  name: "Bushy Bodyguard",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warrior"],
  power: 2,
  toughness: 1,
  text:
    "Offspring {2} (You may pay an additional {2} as you cast this spell. If you do, when this " +
    "creature enters, create a 1/1 token copy of it.)\n" +
    `${ENTER_TEXT} (To forage, exile three cards from your graveyard or sacrifice a Food.)`,
  kicker: { cost: "{2}", keyword: "offspring" },
  triggered: [
    offspringTrigger(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: forageOptions(),
        ifDid: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
