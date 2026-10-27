import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 13349. Lightning Volley's grant
// over every permanent you control (Rain of Filth grants to lands the same
// way); the matches are fixed as it resolves (rule 611.2c). Summoning
// sickness only stops a creature's {T} (rule 302.6, the ruling).
const PING_TEXT = "{T}: This permanent deals 1 damage to any target.";

export default defineCard({
  name: "Flame Fusillade",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Until end of turn, permanents you control gain "${PING_TEXT}"`,
  targets: [],
  effect: {
    kind: "grant-activated-all",
    filter: { controlledBy: "you" },
    ability: {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
    duration: "end-of-turn",
  },
});
