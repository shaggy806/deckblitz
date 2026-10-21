import { defineCard } from "../define.js";

// EDHREC rank 20602. Ikoria: Lair of Behemoths.
//
// Rulings:
//   [2020-04-17] Once you've activated the ability granted by Frondland Felidar, causing the
//     creature to lose that ability (such as by removing Frondland Felidar from the battlefield)
//     won't affect the ability on the stack.
//   [2020-04-17] Frondland Felidar's last ability applies to itself as long as it still has
//     vigilance.
//   [2020-04-17] Tapping an attacking creature doesn't remove it from combat.
//
// `withKeyword` matches each creature's current keywords (a granted vigilance
// counts), so it covers the Felidar itself while it has vigilance.

const GRANT_TEXT = 'Creatures you control with vigilance have "{1}, {T}: Tap target creature."';

export default defineCard({
  name: "Frondland Felidar",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "vigilance" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true },
          targets: ["creature"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "{1}, {T}: Tap target creature.",
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
