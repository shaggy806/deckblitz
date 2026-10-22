import { defineCard } from "../define.js";

// EDHREC rank 14719. Torpor Orb's static on a creature.
//
// Rulings:
//   [2017-09-29] Replacement effects, such as a permanent entering the battlefield tapped or with
//     counters on it, are unaffected.
//   [2017-09-29] Tocatli Honor Guard's ability stops a creature's own enters-the-battlefield
//     triggered abilities as well as other triggered abilities that would trigger when a creature
//     enters the battlefield. This includes abilities that would trigger when Tocatli Honor Guard
//     itself enters the battlefield.

const TEXT = "Creatures entering don't cause abilities to trigger.";

export default defineCard({
  name: "Tocatli Honor Guard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      suppressEntryTriggers: { who: "everyone", entering: { type: "creature" } },
      text: TEXT,
    },
  ],
});
