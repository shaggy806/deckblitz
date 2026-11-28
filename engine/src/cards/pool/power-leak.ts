import { defineCard } from "../define.js";

// "The upkeep of enchanted enchantment's controller" is the upkeep of whoever
// controls it as that upkeep begins (`whileCondition`, as Feedback's), and
// "that player" is that upkeep's player: they alone may pay any amount of mana
// (`players-pay-any-amount` of `who: "active-player"`), then the Aura deals 2
// damage to them with X of it prevented — a prevention effect, not less damage
// (rule 615.6; `damage`'s `prevent`), so damage that can't be prevented is
// dealt in full (615.12).

const TEXT =
  "At the beginning of the upkeep of enchanted enchantment's controller, that player may pay any amount of mana. This Aura deals 2 damage to that player. Prevent X of that damage, where X is the amount of mana that player paid this way.";

export default defineCard({
  name: "Power Leak",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant enchantment\n${TEXT}`,
  targets: ["enchantment"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "players-pay-any-amount",
        resource: "mana",
        who: "active-player",
        then: { kind: "damage", amount: 2, who: "that-player", prevent: "x" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
