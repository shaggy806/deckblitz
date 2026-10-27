import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 23329.
//
// Rulings:
//   [2022-12-08] If this creature would be dealt damage from multiple sources at the same time
//     (say, because it's blocked by multiple creatures), all of the damage is prevented and only
//     one +1/+1 counter is removed.
//   [2022-12-08] If damage that would be dealt to this creature can't be prevented, the damage is
//     dealt and a +1/+1 counter is removed from this creature.
//   [2022-12-08] If this creature has no +1/+1 counters on it (but is still on the battlefield
//     because something else is raising its toughness), damage that would be dealt to it is still
//     prevented.
//
// Unbreathing Horde's replacement: unconditional (still prevents with no
// counters), once per damage event (`perEvent`).

const ENTER_TEXT = "This creature enters with three +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

export default defineCard({
  name: "Phantom Flock",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Soldier", "Spirit"],
  power: 0,
  toughness: 0,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTER_TEXT,
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        prevent: true,
        perEvent: true,
        to: "self",
        then: { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      text: PREVENT_TEXT,
    },
  ],
});
