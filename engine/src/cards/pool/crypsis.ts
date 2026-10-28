import { defineCard } from "../define.js";

// EDHREC rank 16931.
//
// "Creatures your opponents control" is the caster's opponents as it
// resolves, fixed then (`grant-protection` rewrites the filter's side).
export default defineCard({
  name: "Crypsis",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature you control gains protection from creatures your opponents control until end of turn. Untap it.",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "grant-protection",
        target: 0,
        from: { filter: { type: "creature", controlledBy: "opponent" } },
        duration: "end-of-turn",
      },
      { kind: "untap", target: 0 },
    ],
  },
});
