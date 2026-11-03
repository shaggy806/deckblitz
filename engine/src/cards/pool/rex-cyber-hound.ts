import { defineCard } from "../define.js";

// Not linked to Rex: "all cards in exile with brain counters on them", whoever
// put them there (a second Rex reads them, and a Rex back from a blink).
const DAMAGE_TEXT =
  "Whenever Rex deals combat damage to a player, they mill two cards and you get {E}{E} (two energy counters).";
const EXILE_TEXT = "Pay {E}{E}: Choose target creature card in a graveyard. Exile it with a brain counter on it. Activate only as a sorcery.";
const GRANT_TEXT = "Rex has all activated abilities of all cards in exile with brain counters on them.";

export default defineCard({
  name: "Rex, Cyber-Hound",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Dog"],
  power: 2,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n${EXILE_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "trigger-player", amount: 2 },
          { kind: "get-energy", amount: 2 },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payEnergy: 2 },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "exile", target: 0, withCounters: { kind: "brain", amount: 1 } },
      sorcerySpeed: true,
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "exile", filter: { counters: { kind: "brain", compare: { op: "gte", n: 1 } } } },
      text: GRANT_TEXT,
    },
  ],
});
