import { defineCard } from "../define.js";

// EDHREC rank 31536. Guilds of Ravnica. Estwald Shieldbasher's attack-time
// payment, for flying.

const ATTACK_TEXT = "Whenever this creature attacks, you may pay {1}{W}. If you do, it gains flying until end of turn.";

export default defineCard({
  name: "Skyline Scout",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 2,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{W} to give this creature flying until end of turn?",
        cost: "{1}{W}",
        effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
