import { defineCard } from "../define.js";

const REINFORCE_TEXT =
  "Reinforce 2—{2}{W} ({2}{W}, Discard this card: Put two +1/+1 counters on target creature.)";

export default defineCard({
  name: "Burrenton Bombardier",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${REINFORCE_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: REINFORCE_TEXT,
    },
  ],
});
