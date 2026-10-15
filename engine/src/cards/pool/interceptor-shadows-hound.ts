import { defineCard } from "../define.js";

// EDHREC rank 10983. Final Fantasy.
//
// Rulings:
//   [2025-06-06] As Interceptor returns to the battlefield because of its triggered ability, you
//     choose which player, planeswalker, or battle it's attacking. It doesn't have to attack the
//     same player, planeswalker, or battle as your legendary creatures.
//   [2025-06-06] Although Interceptor's last ability causes it to enter attacking, it was never
//     declared as an attacking creature. Abilities that trigger whenever a creature attacks won't
//     trigger when it enters attacking.
//
// Vanguard of the Restless's graveyard "you may pay … If you do, return this
// card", on an `attack-with` trigger (once per declaration, however many
// legendary attackers), entering tapped and attacking whichever defender you
// choose (`attacking: "choose"` — the first ruling).
const MENACE_TEXT = "Assassins you control have menace.";
const RETURN_TEXT =
  "Whenever you attack with one or more legendary creatures, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking.";

export default defineCard({
  name: "Interceptor, Shadow's Hound",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${MENACE_TEXT}\n${RETURN_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Assassin", controlledBy: "you" } },
      grantKeywords: ["menace"],
      text: MENACE_TEXT,
    },
  ],
  triggered: [
    {
      fromGraveyard: true,
      trigger: {
        on: "attack-with",
        who: "you",
        atLeast: 1,
        filter: { type: "creature", supertype: "legendary" },
      },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to return Interceptor, Shadow's Hound tapped and attacking?",
        cost: "{2}{B}",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
