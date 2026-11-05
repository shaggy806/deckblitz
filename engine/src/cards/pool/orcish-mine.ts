import { defineCard } from "../define.js";

// One ability with two trigger events (`sameAbilityAs`). The last ore
// counter's trigger names the land's controller before the land is destroyed
// (`for-each-player` over `"attached-controller"`), so the damage still finds
// that player once the land is gone.

const REMOVE_TEXT =
  "At the beginning of your upkeep and whenever enchanted land becomes tapped, remove an ore counter from this Aura.";
const LAST_TEXT =
  "When the last ore counter is removed from this Aura, destroy enchanted land and this Aura deals 2 damage to that land's controller.";
const REMOVE_ORE = { kind: "remove-counter", target: "source", counter: "ore", amount: 1 } as const;

export default defineCard({
  name: "Orcish Mine",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant land\nThis Aura enters with three ore counters on it.\n${REMOVE_TEXT}\n${LAST_TEXT}`,
  targets: ["land"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "ore", amount: 3 } },
      text: "This Aura enters with three ore counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: REMOVE_ORE,
      resolve: null,
      text: REMOVE_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      sameAbilityAs: 0,
      targets: [],
      effect: REMOVE_ORE,
      resolve: null,
      text: REMOVE_TEXT,
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "ore", last: true },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "attached-controller",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: "attached" },
            { kind: "damage", amount: 2, who: "that-player" },
          ],
        },
      },
      resolve: null,
      text: LAST_TEXT,
    },
  ],
});
