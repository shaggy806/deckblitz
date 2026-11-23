import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Each trigger waits for what made you
// search or scry to finish resolving (its rulings), as every trigger does.
// "Your library" is your own: a search of another player's doesn't count.
const SEARCH_TEXT = "Whenever you search your library, scry 1.";
const SCRY_TEXT =
  "Scryfall — Whenever you scry, put a +1/+1 counter on Search Elemental. It can't be blocked this turn.";

export default defineCard({
  name: "Search Elemental",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 1,
  text: `${SEARCH_TEXT}\n${SCRY_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "searches-library", who: "you" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: SEARCH_TEXT,
    },
    {
      trigger: { on: "scries", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword", target: "source", keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SCRY_TEXT,
    },
  ],
});
