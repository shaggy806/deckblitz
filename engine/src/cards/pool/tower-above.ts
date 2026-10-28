import { defineCard } from "../define.js";

// The granted trigger may target any creature (the ruling): one that can't
// block this creature is simply free of the requirement.

const ATTACK_TEXT = "When this creature attacks, target creature blocks it this turn if able.";

export default defineCard({
  name: "Tower Above",
  manaCost: "{2/G}{2/G}{2/G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "({2/G} can be paid with any two mana or with {G}. This card's mana value is 6.)\nUntil end of turn, target creature gets +4/+4 and gains trample, wither, and \"When this creature attacks, target creature blocks it this turn if able.\" (It deals damage to creatures in the form of -1/-1 counters.)",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 4, toughness: 4, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "wither", duration: "end-of-turn" },
      {
        kind: "grant-triggered",
        target: 0,
        duration: "end-of-turn",
        ability: {
          trigger: { on: "attacks", who: "self" },
          targets: ["creature"],
          effect: { kind: "block-if-able", target: 0, attacker: "source" },
          resolve: null,
          text: ATTACK_TEXT,
        },
      },
    ],
  },
});
