import { defineCard } from "../define.js";

// EDHREC rank 19299. Once per player damaged, {2} at most once each (the ruling).
const HIT_TEXT =
  "Whenever this creature deals combat damage to a player, you may pay {2}. If you do, create a 2/2 black Zombie creature token and each opponent mills two cards.";

export default defineCard({
  name: "Necromaster Dragon",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${HIT_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 2/2 Zombie and have each opponent mill two cards?",
        cost: "{2}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "create-token", token: "Zombie Token", count: 1 },
            { kind: "mill", target: "each-opponent", amount: 2 },
          ],
        },
      },
      resolve: null,
      text: HIT_TEXT,
    },
  ],
});
