import { defineCard } from "../define.js";

// Kamigawa: Neon Dynasty (NEO). EDHREC rank 14964.
//
// A `source` condition granting the trigger: enchanted (an Aura, anyone's), equipped (an
// Equipment, anyone's) and a counter of any kind, all three at once. The granted trigger is
// Hydra Omnivore's with a draw of the same amount first.

const GRANTED_TEXT =
  "Whenever Kosei deals combat damage to an opponent, you draw that many cards and Kosei deals that much damage to each other opponent.";
const TEXT = `As long as Kosei is enchanted, equipped, and has a counter on it, Kosei has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Kosei, Penitent Warlord",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ogre", "Samurai"],
  power: 0,
  toughness: 5,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "source",
        filter: { enchanted: true, equipped: true, counters: { compare: { op: "gte", n: 1 } } },
      },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: { triggerValue: true } },
              { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
