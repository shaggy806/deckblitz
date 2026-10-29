import { defineCard } from "../define.js";

// Rulings:
//   [2017-03-14] If the enchanted creature's power isn't 4 or greater when the end step begins,
//     the last ability won't trigger at all.
//   [2017-03-14] Arachnus Web's triggered ability checks at the beginning of each end step, not
//     just yours.
//   [2017-03-14] If Arachnus Web's last ability triggers, but the enchanted creature's power is
//     reduced to 3 or less before the ability resolves, the ability will have no effect.

const DESTROY_TEXT =
  "At the beginning of the end step, if enchanted creature's power is 4 or greater, destroy this Aura.";

export default defineCard({
  name: "Arachnus Web",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature can't attack or block, and its activated abilities can't be activated.\n${DESTROY_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      // Each end step (the ruling); an intervening if, checked again as it resolves.
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "source", filter: { attachedTo: { power: { op: "gte", n: 4 } } } },
      targets: [],
      effect: { kind: "destroy", target: "source" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: "Enchanted creature can't attack or block, and its activated abilities can't be activated.",
    },
  ],
});
