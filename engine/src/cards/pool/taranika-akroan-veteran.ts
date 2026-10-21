import { defineCard } from "../define.js";

// Not optional, and an untapped target still becomes 4/4 (the rulings). The
// base P/T is layer 7b, so counters and pumps still apply on top; untapping
// an attacker doesn't remove it from combat.
const ATTACK_TEXT =
  "Whenever Taranika attacks, untap another target creature you control. Until end of turn, that creature has base power and toughness 4/4 and gains indestructible.";

export default defineCard({
  name: "Taranika, Akroan Veteran",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          {
            kind: "animate",
            target: 0,
            power: 4,
            toughness: 4,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
