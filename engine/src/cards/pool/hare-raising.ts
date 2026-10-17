import { defineCard } from "../define.js";

// Pollen-Shield Hare's Adventure. X is counted once, as it resolves (its
// ruling) — Treeguard Duo's pump.
const TEXT =
  "Target creature you control gains vigilance and gets +X/+X until end of turn, where X is the number of creatures you control.";

const X = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Hare Raising",
  art: "https://cards.scryfall.io/art_crop/back/1/3/139f31f5-28f0-4e90-abdf-3f6ed0992dea.jpg",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: TEXT,
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
    ],
  },
  faces: ["Pollen-Shield Hare", "Hare Raising"],
  adventure: true,
});
