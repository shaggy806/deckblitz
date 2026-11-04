import { defineCard } from "../define.js";

// Either mode reaches a permanent or a suspended card, on the battlefield or in
// exile; the last time counter off a suspended card triggers its cast.
const REMOVE = "Remove two time counters from target permanent or suspended card.";
const PUT = "Put two time counters on target permanent with a time counter on it or suspended card.";
const ETB = `When this creature enters, choose one —\n• ${REMOVE}\n• ${PUT}`;
const SUSPENDED = { kind: "card-in-exile", filter: { suspended: true } } as const;

export default defineCard({
  name: "Shivan Sand-Mage",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Shaman"],
  power: 3,
  toughness: 2,
  suspend: { n: 4, cost: "{R}" },
  text: `${ETB}\nSuspend 4—{R} (Rather than cast this card from your hand, you may pay {R} and exile it with four time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost. It has haste.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: REMOVE,
            targets: [{ kind: "one-of", of: ["permanent", SUSPENDED] }],
            effect: { kind: "remove-counter", target: 0, counter: "time", amount: 2 },
          },
          {
            text: PUT,
            targets: [
              {
                kind: "one-of",
                of: [{ kind: "permanent", filter: { counters: { kind: "time", compare: { op: "gte", n: 1 } } } }, SUSPENDED],
              },
            ],
            effect: { kind: "add-counter", target: 0, counter: "time", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: ETB,
    },
  ],
});
