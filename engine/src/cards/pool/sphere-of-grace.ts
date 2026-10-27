import { defineCard } from "../define.js";

// Odyssey. Plated Pegasus's shape: preventing 2 of the damage is dealing 2
// less (the engine has no "can't be prevented"), and Game.dealDamage orders
// it against any doubler the way that's best for the player dealt the damage
// (rule 616.1). The source's colour is read as the damage is dealt.

const TEXT = "If a black source would deal damage to you, prevent 2 of that damage.";

export default defineCard({
  name: "Sphere of Grace",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", plus: -2, source: { colors: ["B"] }, to: "you" },
      text: TEXT,
    },
  ],
});
