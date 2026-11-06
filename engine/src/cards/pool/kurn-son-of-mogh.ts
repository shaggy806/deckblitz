import { defineCard } from "../define.js";

// Star Trek Commander (TRC). X counts the opponents attacked this turn as the
// trigger resolves, this attack included.

const TEXT =
  "Battlefront — Whenever Kurn attacks, you draw X cards and lose X life, where X is the number of opponents you attacked this turn.";
const X = { turnStat: "opponents-attacked" } as const;

export default defineCard({
  name: "Kurn, Son of Mogh",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: X },
          { kind: "lose-life", amount: X, who: "you" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
