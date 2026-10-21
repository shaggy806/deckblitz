import { defineCard } from "../define.js";

// "If it's not their turn": `offTurn` — only a spell cast by someone other
// than the active player, which can't change before the ability resolves.

const TRIGGER_TEXT = "Whenever a player casts a spell, if it's not their turn, that player draws a card.";

export default defineCard({
  name: "Glademuse",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", offTurn: true },
      targets: [],
      effect: { kind: "draw", who: "trigger-controller", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
