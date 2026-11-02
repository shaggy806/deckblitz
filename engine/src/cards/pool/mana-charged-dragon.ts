import { defineCard } from "../define.js";

const JOIN =
  "Join forces — Whenever this creature attacks or blocks, each player starting with you may pay any amount of mana. This creature gets +X/+0 until end of turn, where X is the total amount of mana paid this way.";

export default defineCard({
  name: "Mana-Charged Dragon",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${JOIN}`,
  triggered: (["attacks", "blocks"] as const).map((on) => ({
    trigger: { on, who: "self" as const },
    targets: [],
    effect: {
      kind: "players-pay-any-amount" as const,
      resource: "mana" as const,
      startingWithYou: true as const,
      then: { kind: "modify-pt" as const, target: "source" as const, power: "x" as const, toughness: 0, duration: "end-of-turn" as const },
    },
    resolve: null,
    text: JOIN,
  })),
});
