import { defineCard } from "../define.js";

// EDHREC rank 18599.
//
// "That player" is who the land entered under (`refsAtTrigger`). The
// intervening if (rule 603.4) reads that player's own journal of what
// entered under their control this turn: the land that fired it is one, so
// "another" is two or more, asked as it triggers and again on resolution.
const TEXT =
  "Whenever a land enters under an opponent's control, if that player had another land enter the battlefield under their control this turn, this creature deals 3 damage to that player.";

export default defineCard({
  name: "Tunnel Ignus",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "land", controlledBy: "opponent" } },
      condition: { kind: "turn-history", what: "entered", of: "that-player", filter: { type: "land" }, atLeast: 2 },
      targets: [],
      effect: { kind: "damage", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
