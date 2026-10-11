import { defineCard } from "../define.js";

// EDHREC rank 11061.
//
// Rulings:
//   [2026-06-29] Thranduil's Company's first ability is cumulative with other effects that let you
//     play additional lands, such as the one from Exploration.
//   [2026-06-29] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//
// "Another Elf": a static's condition already leaves its own permanent out of
// the count (Dáin's Company's shape).
const LANDS_TEXT = "As long as you control another Elf, you may play an additional land on each of your turns.";
const LANDFALL_TEXT =
  "Landfall — Whenever a land you control enters, put two +1/+1 counters on target creature you control. It gains vigilance until end of turn.";

export default defineCard({
  name: "Thranduil's Company",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Soldier"],
  power: 3,
  toughness: 4,
  text: `${LANDS_TEXT}\n${LANDFALL_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Elf" }, atLeast: 1 },
      extraLandsPerTurn: 1,
      text: LANDS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
