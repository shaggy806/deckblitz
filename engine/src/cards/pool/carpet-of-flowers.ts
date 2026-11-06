import type { TriggeredAbility } from "../../abilities.js";
import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// Urza's Saga (USG). EDHREC rank 1325. "Each of your main phases" is two
// trigger events of one ability (`sameAbilityAs`), so they share one record:
// the `may`'s `oncePerTurn` keeps whether mana was added with it this turn,
// and the intervening if (rule 603.4) reads that record
// (`this-ability-did-this-turn`) as it triggers and as it resolves — once
// it's added mana, the ability doesn't trigger again that turn. Not a mana
// ability (its ruling): it uses the stack and targets. X counts the Islands
// the target opponent controls as it resolves.
const TEXT =
  "At the beginning of each of your main phases, if you haven't added mana with this ability this turn, you may add X mana of any one color, where X is the number of Islands target opponent controls.";

const ISLANDS = { countOf: { subtype: "Island", controlledBy: "you" }, forTarget: 0 } as const;

const ADD: EffectSpec = {
  kind: "may",
  prompt: "Add X mana of any one color (X = the Islands target opponent controls)?",
  oncePerTurn: true,
  effect: { kind: "add-mana", mana: "any-color", amount: ISLANDS },
};

const ability = (step: "precombat-main" | "postcombat-main"): TriggeredAbility => ({
  trigger: { on: "step-begins", step, who: "you" },
  condition: { kind: "not", of: { kind: "this-ability-did-this-turn" } },
  targets: ["opponent"],
  effect: ADD,
  resolve: null,
  text: TEXT,
  ...(step === "postcombat-main" ? { sameAbilityAs: 0 } : {}),
});

export default defineCard({
  name: "Carpet of Flowers",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [ability("precombat-main"), ability("postcombat-main")],
});
