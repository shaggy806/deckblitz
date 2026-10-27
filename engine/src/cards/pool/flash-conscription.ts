import { defineCard } from "../define.js";

export default defineCard({
  name: "Flash Conscription",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Untap target creature and gain control of it until end of turn. That creature gains haste until end of turn. If {W} was spent to cast this spell, the creature gains \"Whenever this creature deals combat damage, you gain that much life\" until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "untap", target: 0 },
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { W: 1 } } },
        // "You" is the creature's controller as it deals the damage (the ruling).
        then: {
          kind: "grant-triggered",
          target: 0,
          duration: "end-of-turn",
          ability: {
            trigger: { on: "deals-damage", who: "self", combat: true },
            targets: [],
            effect: { kind: "gain-life", amount: { triggerValue: true } },
            resolve: null,
            text: "Whenever this creature deals combat damage, you gain that much life.",
          },
        },
      },
    ],
  },
});
