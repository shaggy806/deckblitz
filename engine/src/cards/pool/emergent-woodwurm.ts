import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// X is the creature's power as the trigger resolves, or as it last existed
// on the battlefield if it has left (the ruling). On a creature backup
// granted the ability to, "its" is that creature (the ability's source).

const ATTACK_TEXT =
  "Whenever this creature attacks, look at the top X cards of your library, where X is its power. You may put a permanent card with mana value X or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: { powerOf: "source" },
    min: 0,
    max: 1,
    filter: {
      typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
      manaValue: { op: "lte", n: { amount: { powerOf: "source" } } },
    },
    destination: "battlefield",
    leftover: "bottom-random",
  },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Emergent Woodwurm",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 4,
  toughness: 4,
  text: `Backup 3 (When this creature enters, put three +1/+1 counters on target creature. If that's another creature, it gains the following ability until end of turn.)\n${ATTACK_TEXT}`,
  triggered: [backup(3, { triggered: [ATTACK] }), ATTACK],
});
