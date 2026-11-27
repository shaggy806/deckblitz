import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). The life is gained as the shield prevents
// damage, by the spell's controller, only as much as it actually prevents.

export default defineCard({
  name: "Candles' Glow",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Prevent the next 3 damage that would be dealt to any target this turn. You gain life equal to the damage prevented this way.\nSplice onto Arcane {1}{W} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{1}{W}" },
  targets: ["any-target"],
  effect: { kind: "prevent-damage", target: 0, amount: 3, gainLifePrevented: true },
});
