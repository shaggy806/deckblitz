import { defineCard } from "../define.js";

const TEXT =
  "Whenever a nontoken creature you control attacks, you may pay {W}. If you do, create a 1/1 white Kithkin Soldier creature token that's tapped and attacking.";

export default defineCard({
  name: "Militia's Pride",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["kindred", "enchantment"],
  subtypes: ["Kithkin"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "you-control", filter: { token: false, type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to create a 1/1 Kithkin Soldier token that's tapped and attacking?",
        cost: "{W}",
        // The token's controller chooses what it attacks (the ruling).
        effect: { kind: "create-token", token: "Kithkin Soldier Token", count: 1, tapped: true, attacking: "choose" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
