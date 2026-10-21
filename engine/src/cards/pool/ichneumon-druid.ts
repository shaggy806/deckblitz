import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 28944.
// Rulings:
//   It tracks the instant count for each player separately.
// Every instant an opponent casts but their first this turn: Alania's
// `trigger-spell-first`, negated — the caster's own spells, each read as it
// was cast, so a spell cast in response doesn't change the answer. "That
// player" is the spell's caster.

const TEXT =
  "Whenever an opponent casts an instant spell other than the first instant spell that player casts each turn, this creature deals 4 damage to that player.";

export default defineCard({
  name: "Ichneumon Druid",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "instant" } },
      condition: { kind: "not", of: { kind: "trigger-spell-first", anyOf: [{ filter: { type: "instant" } }] } },
      targets: [],
      effect: { kind: "damage", amount: 4, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
