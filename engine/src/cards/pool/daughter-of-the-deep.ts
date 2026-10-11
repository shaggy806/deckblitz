import { defineCard } from "../define.js";

// EDHREC rank 14413.
//
// "Target Merfolk" is any permanent with the creature type — a Kindred one
// too — not only a creature.

const DRAW_TEXT = "Whenever you draw your second card each turn, create a 1/1 blue Merfolk creature token.";
const UNBLOCKABLE_TEXT = "{U}, {T}: Target Merfolk can't be blocked this turn.";

export default defineCard({
  name: "Daughter of the Deep",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Noble"],
  power: 2,
  toughness: 1,
  text: `${DRAW_TEXT}\n${UNBLOCKABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Merfolk Token", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{U}", tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Merfolk" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
      resolve: null,
      text: UNBLOCKABLE_TEXT,
    },
  ],
});
