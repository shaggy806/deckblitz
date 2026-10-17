import { defineCard } from "../define.js";

// EDHREC rank 19562.
//
// "During an opponent's turn" is part of the trigger condition (rule 603.1 —
// `whileCondition`), not an intervening "if"; in a free-for-all every other
// player's turn is an opponent's.

const TEXT =
  "Whenever you cast a spell during an opponent's turn, up to one target creature an opponent controls gets -1/-1 until end of turn.";

export default defineCard({
  name: "Dream Spoilers",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Faerie", "Warlock"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      whileCondition: { kind: "not", of: { kind: "your-turn" } },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
      effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
