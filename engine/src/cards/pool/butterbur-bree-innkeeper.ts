import { defineCard } from "../define.js";

// EDHREC rank 12587.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2023-06-16] Butterbur, Bree Innkeeper's ability checks if you control a Food at the beginning
//     of your end step. If you do, the ability won't trigger.
//   [2023-06-16] If the ability does trigger, but you control a Food when it tries to resolve, the
//     ability will do nothing. No Food will be created.

const TEXT = "At the beginning of your end step, if you don't control a Food, create a Food token.";

export default defineCard({
  name: "Butterbur, Bree Innkeeper",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 3,
  toughness: 3,
  text: `${TEXT} (It's an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      // An intervening if (rule 603.4): asked as the step begins and again on resolution.
      condition: { kind: "not", of: { kind: "controls", filter: { subtype: "Food" }, atLeast: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
