import { defineCard } from "../define.js";

/** The nightbound back face of Outland Liberator. Its attack trigger is
 * Kogla, the Titan Ape's. */
const SAC_TEXT = "{1}, Sacrifice this creature: Destroy target artifact or enchantment.";
const ATTACK_TEXT = "Whenever this creature attacks, destroy target artifact or enchantment defending player controls.";

export default defineCard({
  name: "Frenzied Trapbreaker",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/6/0/60e53d61-fcc3-4def-8206-052b46f62deb.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["nightbound"],
  text: `${SAC_TEXT}\n${ATTACK_TEXT}\nNightbound (If a player casts at least two spells during their own turn, it becomes day next turn.)`,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "self" },
      targets: ["artifact-or-enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Outland Liberator", "Frenzied Trapbreaker"],
  transform: true,
});
