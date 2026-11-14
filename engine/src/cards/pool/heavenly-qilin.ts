import { defineCard } from "../define.js";

// EDHREC rank 30279. Starry-Eyed Skyrider's trigger, word for word.
const ATTACKS = "Whenever this creature attacks, another target creature you control gains flying until end of turn.";

export default defineCard({
  name: "Heavenly Qilin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kirin"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying (This creature can't be blocked except by creatures with flying or reach.)\n${ATTACKS}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: ATTACKS,
    },
  ],
});
