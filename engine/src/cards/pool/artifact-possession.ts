import { defineCard } from "../define.js";

// One ability with two trigger events, written as two triggers (Cryoshatter's
// shape). "That artifact's controller" is the enchanted artifact's as the
// ability triggered, read as it last existed if it has left. The activation
// half is any player's activation (`who: "attached"` without `activator`), a
// mana ability's too (`orMana`), and only one whose cost has no {T} — one
// with {T} taps the artifact, which the first half sees instead.

const TEXT =
  "Whenever enchanted artifact becomes tapped or a player activates an ability of enchanted artifact without {T} in its activation cost, this Aura deals 2 damage to that artifact's controller.";

export default defineCard({
  name: "Artifact Possession",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: { controllerOf: "attached-as-triggered" } },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "attached", orMana: true, withoutTapCost: true },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "damage", amount: 2, who: { controllerOf: "attached-as-triggered" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
