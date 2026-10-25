import { defineCard } from "../define.js";

export default defineCard({
  name: "Fleetfeather Cockatrice",
  manaCost: "{3}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Cockatrice"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "flying", "deathtouch"],
  text: "Flash (You may cast this spell any time you could cast an instant.)\nFlying, deathtouch\n{5}{G}{U}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)",
  activated: [
    {
      cost: { mana: "{5}{G}{U}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: "{5}{G}{U}: Monstrosity 3.",
    },
  ],
});
