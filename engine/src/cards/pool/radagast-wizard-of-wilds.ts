import { defineCard } from "../define.js";

// EDHREC rank 13647.
// Makes Beast → use "3/3 Beast Token"; Bird → "2/2 Blue Bird Token".
//
// Rulings:
//   [2023-06-16] If Radagast, Wizard of Wilds is a Beast or a Bird, it will have two instances of
//     ward {1}.
//   [2023-06-16] A creature that is both a Beast and a Bird still only gets one instance of ward
//     {1} from Radagast, Wizard of Wilds's first ability.
//   [2023-06-16] Radagast, Wizard of the Wilds's last triggered ability will resolve before the
//     spell that caused it to trigger resolves. It will resolve even if the spell that caused it
//     to trigger is countered or has otherwise left the stack.

const GRANT_TEXT = "Beasts and Birds you control have ward {1}.";
const CAST_TEXT = "Whenever you cast a spell with mana value 5 or greater, choose one —";
const BEAST_MODE = "• Create a 3/3 green Beast creature token.";
const BIRD_MODE = "• Create a 2/2 blue Bird creature token with flying.";
const WARD_1 = {
  trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
  targets: [],
  effect: { kind: "ward", cost: { mana: "{1}" } },
  resolve: null,
  text: "Ward {1}",
} as const;

export default defineCard({
  name: "Radagast, Wizard of Wilds",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 3,
  toughness: 5,
  text: `Ward {1}\n${GRANT_TEXT}\n${CAST_TEXT}\n${BEAST_MODE}\n${BIRD_MODE}`,
  static: [
    {
      // Radagast itself too, when it's a Beast or a Bird (a second ward — the ruling).
      affects: { scope: "filter", filter: { subtypes: ["Beast", "Bird"], controlledBy: "you" } },
      grantsTriggered: [WARD_1],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    WARD_1,
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 5 } } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: BEAST_MODE, effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 } },
          { text: BIRD_MODE, effect: { kind: "create-token", token: "2/2 Blue Bird Token", count: 1 } },
        ],
      },
      resolve: null,
      text: `${CAST_TEXT} ${BEAST_MODE} ${BIRD_MODE}`,
    },
  ],
});
