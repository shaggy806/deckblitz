import { defineCard } from "../define.js";

// EDHREC rank 7404.
//
// Rulings:
//   [2024-11-08] If you gain life during your turn before Cat Collector is on the battlefield, its
//     last ability won't trigger that turn even if you gain life again later in the turn.
//   [2024-11-08] Cat Collector's last ability triggers just once and creates just one Cat token
//     for the first life-gaining event on each of your turns, no matter how much life you gain.

const CAT_TEXT =
  "Whenever you gain life for the first time during each of your turns, create a 1/1 white Cat creature token.";

// "For the first time" is Gourmand's Talent's `firstTimeEachTurn` (a gain
// earlier in the turn, before this arrived, uses it up — the first ruling);
// "during each of your turns" is the your-turn condition.
export default defineCard({
  name: "Cat Collector",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 2,
  text: `When this creature enters, create a Food token. (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")\n${CAT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Food token.",
    },
    {
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "create-token", token: "Cat Token (Arahbo, the First Fang)", count: 1 },
      resolve: null,
      text: CAT_TEXT,
    },
  ],
});
