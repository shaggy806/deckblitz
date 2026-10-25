import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

const TEXT =
  "Whenever a source an opponent controls deals damage to you or a permanent you control, you may have this creature deal 1 damage to that source's controller.";

// One trigger per recipient (its ruling: a trampler's damage to your blocker
// and to you triggers it twice): damage to you, and damage to a permanent you
// control. The source is the trigger object, so "that source's controller" is
// the `"trigger-controller"` — as the source last was, if it has left.
const punish = (
  to: Extract<TriggeredAbility["trigger"], { on: "deals-damage" }>["to"],
): TriggeredAbility => ({
  trigger:
    to === "you"
      ? { on: "deals-damage", who: "opponent", to: "you" }
      : { on: "deals-damage", who: "opponent", to: "permanent", toFilter: { controlledBy: "you" } },
  targets: [],
  effect: {
    kind: "may",
    prompt: "Have Flameblade Angel deal 1 damage to that source's controller?",
    effect: { kind: "damage", amount: 1, who: "trigger-controller" },
  },
  resolve: null,
  text: TEXT,
});

export default defineCard({
  name: "Flameblade Angel",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [punish("you"), punish("permanent")],
});
