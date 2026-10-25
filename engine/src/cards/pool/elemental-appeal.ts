import { defineCard } from "../define.js";

// Kicked, the token is still a 7/1 that gets +7/+0 until end of turn — not a
// 14/1 (its ruling), so a copy of it is 7/1.

const TOKEN = {
  kind: "create-token",
  token: "Elemental Token 7/1 (Trample, Haste)",
  count: 1,
  exileAtEndStep: true,
} as const;

export default defineCard({
  name: "Elemental Appeal",
  manaCost: "{R}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Kicker {5} (You may pay an additional {5} as you cast this spell.)\nCreate a 7/1 red Elemental creature token with trample and haste. Exile it at the beginning of the next end step. If this spell was kicked, that creature gets +7/+0 until end of turn.",
  effect: TOKEN,
  kicker: {
    cost: "{5}",
    effect: {
      kind: "sequence",
      effects: [
        TOKEN,
        { kind: "modify-pt-all", filter: { thisWay: "created" }, power: 7, toughness: 0, duration: "end-of-turn" },
      ],
    },
  },
});
