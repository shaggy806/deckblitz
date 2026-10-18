import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// X is the attacking creature's power (the ability's source — the creature
// backup granted it to, when granted), read as the target is chosen and
// again as the ability resolves (rule 608.2b).

const ATTACK_TEXT =
  "Whenever this creature attacks, return target nonland permanent card with mana value X or less from your graveyard to the battlefield, where X is this creature's power.";

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [
    {
      kind: "card-in-graveyard",
      whose: "you",
      filter: {
        typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
        notTypes: ["land"],
        manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
      },
    },
  ],
  effect: { kind: "put-onto-battlefield", target: 0 },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Guardian Scalelord",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following abilities until end of turn.)\nFlying\n${ATTACK_TEXT}`,
  triggered: [backup(1, { keywords: ["flying"], triggered: [ATTACK] }), ATTACK],
});
