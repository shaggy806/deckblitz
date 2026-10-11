import { defineCard } from "../define.js";

// EDHREC rank 21577.
// Makes Jace → "Jace Token".
//
// Rulings:
//   [2026-08-21] If you control a Jace planeswalker token, you can't choose to create a new one
//     when you empower Jace. You have to put the loyalty counters on your existing Jace
//     planeswalker token.
//   [2026-08-21] Only one loyalty ability of each planeswalker may be activated per turn, no
//     matter how many it has gained.
//
// The granted −4 is Way of the Pyromancer's grant; "this planeswalker" is the
// granted ability's own source. "Up to one target creature or planeswalker"
// is an optional slot (Dawnsire's), "target player" any player, and the two
// 2-damage instructions are a `sequence` over the two slots (Drakuseth's
// shape): a declined or illegal first target doesn't stop the player's.

const EMPOWER_TEXT =
  "When Way of the Warlord enters, empower Jace 5. (Put five loyalty counters on a Jace token you control. " +
  "If you don't control one, first create a blue Jace planeswalker token with \"[−1]: Surveil 1\" and \"[−3]: Draw a card.\")";
const GRANTED_TEXT =
  "−4: This planeswalker deals 2 damage to up to one target creature or planeswalker and 2 damage to target player.";
const GRANT_TEXT =
  "Planeswalkers you control have \"[−4]: This planeswalker deals 2 damage to up to one target creature or planeswalker and 2 damage to target player.\"";

export default defineCard({
  name: "Way of the Warlord",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${EMPOWER_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "empower-jace", amount: 5 },
      resolve: null,
      text: "When Way of the Warlord enters, empower Jace 5.",
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -4,
          cost: { mana: null, tap: false },
          targets: [
            { kind: "optional", of: { kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } } },
            "player",
          ],
          effect: {
            kind: "sequence",
            // One damage event (Electrolyze's "and").
            simultaneous: true,
            effects: [
              { kind: "damage", amount: 2, target: 0 },
              { kind: "damage", amount: 2, target: 1 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
