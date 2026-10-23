import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {C}. If you do, another target creature gains flying until end of turn. ({C} represents colorless mana.)";

export default defineCard({
  name: "Gravity Negator",
  manaCost: "{3}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Pay {C} to give that creature flying until end of turn?",
        cost: "{C}",
        effect: { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
