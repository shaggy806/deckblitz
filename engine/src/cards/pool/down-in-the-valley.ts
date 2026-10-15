import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 15731.
// Makes Elf → use "Elf Token".
//
// Rulings:
//   [2026-06-29] A landfall ability doesn't trigger if a permanent already on the battlefield
//     becomes a land.
//   [2026-06-29] A landfall ability triggers whenever a land you control enters for any reason. It
//     triggers whenever you play a land, as well as whenever a spell or ability puts a land onto
//     the battlefield under your control.
//   [2026-06-29] Whenever a land you control enters, each landfall ability of permanents you
//     control will trigger. You can put them on the stack in any order. The last ability you put
//     on the stack will be the first one to resolve (as a result, you can have those abilities
//     resolve in the order of your choosing).
//
// Chapter II grants the landfall ability to the Saga itself for as long as it
// stays on the battlefield (Urza's Saga's shape), so it can fire on the turn
// chapters III and IV resolve too.

const I_TEXT = "I — Search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, create a 1/1 green Elf creature token.";
const II_TEXT = `II — This Saga gains "${LANDFALL_TEXT}"`;
const III_TEXT = "III, IV — Elves you control get +1/+0 and gain vigilance until end of turn.";

const LANDFALL: TriggeredAbility = {
  trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
  targets: [],
  effect: { kind: "create-token", token: "Elf Token", count: 1 },
  resolve: null,
  text: LANDFALL_TEXT,
};

const ELVES = { subtype: "Elf", controlledBy: "you" } as const;

export default defineCard({
  name: "Down in the Valley",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "grant-triggered", target: "source", ability: LANDFALL, duration: "permanent" },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3, 4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: ELVES, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: ELVES, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
