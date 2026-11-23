import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Two statics over every creature, each
// player's: an untapped one can't block (Bedlam's restriction, its filter read
// as blockers are declared), and a tapped one may block as though it were
// untapped (Masako the Humorless's permission, rule 509.1a) — which lifts only
// the tapped requirement, nothing else that stops it blocking (the ruling).
// A tapped creature that blocked and then untaps stays blocking (the ruling:
// legality is checked once, at the declaration).

const UNTAPPED_TEXT = "Untapped creatures can't block.";
const TAPPED_TEXT = "Tapped creatures can block.";

export default defineCard({
  name: "Siege Elemental",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${UNTAPPED_TEXT}\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", tapped: false } },
      restrictions: ["cant-block"],
      text: UNTAPPED_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature" } },
      blocksAsThoughUntapped: true,
      text: TAPPED_TEXT,
    },
  ],
});
