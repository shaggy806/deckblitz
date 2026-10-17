import { defineCard } from "../define.js";

// EDHREC rank 9159.
//
// Rulings:
//   [2023-06-16] Celeborn the Wise's first ability has you scry 1 just once whenever you attack
//     with one or more Elves, no matter how many Elves you attack with and no matter how many
//     players you attack.
//   [2023-06-16] Celeborn the Wise's last ability cares about the number of cards you actually
//     looked at. For example, if you were supposed to scry 3 but only had two cards in your
//     library, Celeborn would get +2/+2.

const ATTACK_TEXT = "Whenever you attack with one or more Elves, scry 1.";
const SCRY_TEXT =
  "Whenever you scry, Celeborn gets +1/+1 until end of turn for each card looked at while scrying this way.";
// The `scries` trigger's value is the number of cards actually looked at.
const LOOKED = { triggerValue: true } as const;

export default defineCard({
  name: "Celeborn the Wise",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Noble"],
  power: 3,
  toughness: 3,
  text: `${ATTACK_TEXT}\n${SCRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { subtype: "Elf" } },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: LOOKED, toughness: LOOKED, duration: "end-of-turn" },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
