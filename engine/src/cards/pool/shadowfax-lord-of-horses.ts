import { defineCard } from "../define.js";

// EDHREC rank 12575.
//
// Rulings:
//   [2023-06-16] Although the creature you put onto the battlefield is an attacking creature, it
//     was never declared as an attacking creature. This means that abilities that trigger whenever
//     a creature attacks won't trigger when it enters the battlefield attacking.
//   [2023-06-16] You choose which player, planeswalker, or battle the creature you put onto the
//     battlefield is attacking as it enters the battlefield. It doesn't have to be attacking the
//     same player, planeswalker, or battle that Shadowfax, Lord of Horses is attacking.
//   [2023-06-16] If Shadowfax, Lord of Horses leaves the battlefield before its triggered ability
//     resolves, compare the power of the creature card in your hand with Shadowfax's power as it
//     last existed on the battlefield.
//   [2023-06-16] The creature card you put onto the battlefield needs to have lesser power in your
//     hand than the Shadowfax, Lord of Horses on the battlefield. The creature that enters the
//     battlefield doesn't need to have lesser power than Shadowfax (this can happen if it enters
//     with +1/+1 counters on it, for example).
//
// Ilharg's hand-to-battlefield shape (`attacking: "choose"` — the player picks
// what it attacks), the card's power compared in the hand against
// Shadowfax's power as it resolves, or as it last existed (Kodama of the East
// Tree's dynamic filter).

const HASTE_TEXT = "Horses you control have haste.";
const ATTACK_TEXT =
  "Whenever Shadowfax attacks, you may put a creature card with lesser power from your hand onto the battlefield tapped and attacking.";

export default defineCard({
  name: "Shadowfax, Lord of Horses",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Horse"],
  power: 4,
  toughness: 4,
  text: `${HASTE_TEXT} (They can attack and {T} as soon as they come under your control.)\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Horse", controlledBy: "you" } },
      grantKeywords: ["haste"],
      text: HASTE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        enterTapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
