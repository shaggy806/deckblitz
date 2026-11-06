import { defineCard } from "../define.js";

const TEXT =
  "Battlefront — Whenever Korok attacks, creatures you control get +X/+X until end of turn, where X is the number of opponents you attacked this turn.";

export default defineCard({
  name: "Korok, Liberated Rage",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Klingon", "Borg"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { turnStat: "opponents-attacked" },
        toughness: { turnStat: "opponents-attacked" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
