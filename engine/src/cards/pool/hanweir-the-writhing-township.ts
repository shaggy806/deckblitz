import { defineCard } from "../define.js";

// The combined back face of Hanweir Garrison and Hanweir Battlements (rule
// 712.5b): never a card of its own, only the face of the permanent they meld
// into (`meldOf`). Its mana value there is theirs summed, 3 (rule 712.8g).
//
// Rulings:
//   [2025-01-24] You choose which player, planeswalker, or battle each token is attacking as you
//     create the tokens. It doesn't have to be the same one Hanweir is attacking.
//   [2025-01-24] Although the tokens created by the triggered ability are attacking, they were
//     never declared as attacking creatures.
const ATTACK_TEXT =
  "Whenever Hanweir attacks, create two 3/2 colorless Eldrazi Horror creature tokens that are tapped and attacking.";

export default defineCard({
  name: "Hanweir, the Writhing Township",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Ooze"],
  power: 7,
  toughness: 4,
  keywords: ["trample", "haste"],
  meldOf: ["Hanweir Garrison", "Hanweir Battlements"],
  text: `Trample, haste\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 2, tapped: true, attacking: "choose" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
