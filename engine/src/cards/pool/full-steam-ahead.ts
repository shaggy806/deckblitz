import { defineCard } from "../define.js";

const yours = { type: "creature", controlledBy: "you" } as const;

// "Each creature you control": the ones there as it resolves (the ruling, rule
// 611.2c), so each part is a mass effect locked then.
export default defineCard({
  name: "Full Steam Ahead",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Until end of turn, each creature you control gets +2/+2 and gains trample and \"This creature can't be blocked by more than one creature.\"",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: yours, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: yours, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "grant-static",
        filter: yours,
        ability: {
          affects: { scope: "self" },
          blockedByAtMostOne: true,
          text: "This creature can't be blocked by more than one creature.",
        },
        duration: "end-of-turn",
      },
    ],
  },
});
