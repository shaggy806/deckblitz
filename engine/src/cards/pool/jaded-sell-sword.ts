import { defineCard } from "../define.js";

// EDHREC rank 23040.
//
// The intervening if (rule 603.4) reads where the mana spent to cast it came
// from, which the permanent keeps from its spell (`manaFrom` — Smaug, Wicked
// Worm's clause), checked as it triggers and again as it resolves. Put onto
// the battlefield without being cast, it spent nothing and doesn't trigger.
const TEXT =
  "When this creature enters, if mana from a Treasure was spent to cast it, it gains first strike and haste until end of turn.";

export default defineCard({
  name: "Jaded Sell-Sword",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { manaFrom: { subtype: "Treasure" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
