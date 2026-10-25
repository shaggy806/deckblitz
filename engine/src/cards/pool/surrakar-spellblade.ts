import { defineCard } from "../define.js";

// EDHREC rank 17340. The draw is all X cards or none (the ruling); X is read
// as it resolves, off the creature as it last existed if it has left.

const COUNTER_TEXT = "Whenever you cast an instant or sorcery spell, you may put a charge counter on this creature.";
const DRAW_TEXT =
  "Whenever this creature deals combat damage to a player, you may draw X cards, where X is the number of charge counters on it.";

export default defineCard({
  name: "Surrakar Spellblade",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Surrakar"],
  power: 2,
  toughness: 1,
  text: `${COUNTER_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a charge counter on Surrakar Spellblade?",
        effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card for each charge counter on Surrakar Spellblade?",
        effect: { kind: "draw", amount: { countersOn: "source", counter: "charge" } },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
