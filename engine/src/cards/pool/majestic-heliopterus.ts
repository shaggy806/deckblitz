import { defineCard } from "../define.js";

const ATTACKS = "Whenever this creature attacks, another target Dinosaur you control gains flying until end of turn.";

export default defineCard({
  name: "Majestic Heliopterus",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", filter: { subtype: "Dinosaur", controlledBy: "you" } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
