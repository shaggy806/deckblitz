import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 23760. Phantom Flock's shape.
//
// Rulings:
//   [2022-12-08] If this creature would be dealt damage from multiple sources at the same time
//     (say, because it's blocked by multiple creatures), all of the damage is prevented and only
//     one +1/+1 counter is removed.
//   [2022-12-08] If this creature has no +1/+1 counters on it (but is still on the battlefield
//     because something else is raising its toughness), damage that would be dealt to it is still
//     prevented.
//   [2022-12-08] If damage that would be dealt to this creature can't be prevented, the damage is
//     dealt and a +1/+1 counter is removed from this creature.

const ENTER_TEXT = "This creature enters with four +1/+1 counters on it.";
const PREVENT_TEXT =
  "If damage would be dealt to this creature, prevent that damage. Remove a +1/+1 counter from this creature.";

export default defineCard({
  name: "Phantom Wurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm", "Spirit"],
  power: 2,
  toughness: 0,
  text: `${ENTER_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
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
