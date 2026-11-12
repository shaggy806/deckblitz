import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

// Mystery Booster Commander Edition. "Whenever you cast A or activate B" is one
// ability written as two entries (`sameAbilityAs`), so "do this only once each
// turn" — the `may`'s `oncePerTurn`, keyed by the ability — covers both. The X
// becomes 5 on the stack (`set-x`): no mana is paid or given back for it.
const TEXT =
  "Whenever you cast a permanent spell with {X} in its mana cost or activate an ability with {X} in its activation cost that isn't a mana ability, you may have the value of X become 5. Do this only once each turn.";

const MAKE_FIVE = (target: "trigger-spell" | "trigger-ability"): EffectSpec => ({
  kind: "may",
  prompt: "Have the value of X become 5?",
  oncePerTurn: true,
  effect: { kind: "set-x", target, value: 5 },
});

export default defineCard({
  name: "Glava, Five-Advents Mage",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"], xInManaCost: true },
      },
      targets: [],
      effect: MAKE_FIVE("trigger-spell"),
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "activates-ability", who: "you", xInCost: true },
      sameAbilityAs: 0,
      targets: [],
      effect: MAKE_FIVE("trigger-ability"),
      resolve: null,
      text: TEXT,
    },
  ],
});
