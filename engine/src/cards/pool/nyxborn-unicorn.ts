import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// EDHREC rank 12946.

const MENTOR_TEXT =
  "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)";

const MENTOR: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", attacking: true, power: { op: "lt", n: { amount: { powerOf: "source" } } } },
    },
  ],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
  resolve: null,
  text: MENTOR_TEXT,
};

export default defineCard({
  name: "Nyxborn Unicorn",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Unicorn"],
  power: 2,
  toughness: 2,
  text: `Bestow {3}{W} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${MENTOR_TEXT}\nEnchanted creature gets +2/+2 and has mentor.`,
  bestow: "{3}{W}",
  triggered: [MENTOR],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsTriggered: [MENTOR],
      text: "Enchanted creature gets +2/+2 and has mentor.",
    },
  ],
});
