import { defineCard } from "../define.js";

// EDHREC rank 24724. "Sacrifice enchanted creature" is `hostOfSource` on the cost's
// filter, matched against this Aura; the sacrificed creature's power is as
// it last existed on the battlefield (rule 608.2h), and the Aura, gone to
// its graveyard by then, still deals the damage (its last known
// information).

const TEXT =
  "{R}, Sacrifice enchanted creature: This Aura deals damage equal to the sacrificed creature's power to each creature.";

export default defineCard({
  name: "Bloodfire Infusion",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature you control\n${TEXT}`,
  targets: ["creature-you-control"],
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: { filter: { hostOfSource: true } } },
      targets: [],
      effect: { kind: "damage-all", amount: { powerOf: { paid: "sacrificed" } }, filter: { type: "creature" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
