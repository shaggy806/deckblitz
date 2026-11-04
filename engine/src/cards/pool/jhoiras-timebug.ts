import { defineCard } from "../define.js";

// "You may": neither mode is the player declining. Nothing's offered unless it
// has a time counter as this resolves.
const TEXT =
  "{T}: Choose target permanent you control or suspended card you own. If that permanent or card has a time counter on it, you may remove a time counter from it or put another time counter on it.";

export default defineCard({
  name: "Jhoira's Timebug",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "one-of",
          of: [
            { kind: "permanent", filter: { controlledBy: "you" } },
            { kind: "card-in-exile", whose: "you", filter: { suspended: true } },
          ],
        },
      ],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, now: true, filter: { counters: { kind: "time", compare: { op: "gte", n: 1 } } } },
        then: {
          kind: "modal",
          minModes: 0,
          maxModes: 1,
          modes: [
            { text: "Remove a time counter from it", effect: { kind: "remove-counter", target: 0, counter: "time", amount: 1 } },
            { text: "Put another time counter on it", effect: { kind: "add-counter", target: 0, counter: "time", amount: 1 } },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
