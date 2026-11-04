import { defineCard } from "../define.js";

const EXCESS =
  "Whenever a creature an opponent controls is dealt excess noncombat damage, amass Orcs X, where X is that excess damage. (Put X +1/+1 counters on an Army you control. It's also an Orc. If you don't control an Army, create a 0/0 black Orc Army creature token first.)";
const SHOOT = "{7}{R}: This enchantment deals 7 damage to target creature.";

export default defineCard({
  name: "Fall of Cair Andros",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${EXCESS}\n${SHOOT}`,
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "opponent", filter: { type: "creature" }, combat: false, excess: true },
      targets: [],
      effect: { kind: "amass", amount: { triggerValue: true }, creatureType: "Orc" },
      resolve: null,
      text: EXCESS,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}{R}", tap: false },
      targets: ["creature"],
      effect: { kind: "damage", amount: 7, target: 0 },
      resolve: null,
      text: SHOOT,
    },
  ],
});
