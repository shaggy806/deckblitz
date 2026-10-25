import { defineCard } from "../define.js";

export default defineCard({
  name: "Akroan Conscriptor",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Shaman"],
  power: 3,
  toughness: 2,
  text: "Heroic — Whenever you cast a spell that targets this creature, gain control of another target creature until end of turn. Untap that creature. It gains haste until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, gain control of another target creature until end of turn. Untap that creature. It gains haste until end of turn.",
    },
  ],
});
