import { defineCard } from "../define.js";

// EDHREC rank 7886. A results table (rule 706.3a); "Siege Monster" is an ability word. Each
// sacrifice is chosen in turn order from the active player and then made at once (its ruling,
// rule 101.4 — the `sacrifice` effect's queue).
const TEXT =
  "Siege Monster — When this creature enters, roll a d20.\n1—9 | Each player sacrifices a permanent of their choice.\n10—19 | Each opponent sacrifices a permanent of their choice.\n20 | Each opponent sacrifices two permanents of their choice.";

export default defineCard({
  name: "Earth-Cult Elemental",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: { kind: "sacrifice", who: "each-player", filter: {}, count: 1 } },
          { min: 10, max: 19, effect: { kind: "sacrifice", who: "each-opponent", filter: {}, count: 1 } },
          { min: 20, effect: { kind: "sacrifice", who: "each-opponent", filter: {}, count: 2 } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
