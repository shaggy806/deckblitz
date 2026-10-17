import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 14463.

const ATTACH_TEXT =
  "Whenever Frodo enters or attacks, you may attach target Equipment you control with mana value 2 or 3 to Frodo.";
const PREVENT_TEXT = "During your turn, prevent all damage that would be dealt to Frodo.";

const attach = (trigger: TriggeredAbility["trigger"], sameAbilityAs?: number): TriggeredAbility => ({
  trigger,
  ...(sameAbilityAs !== undefined ? { sameAbilityAs } : {}),
  targets: [
    {
      kind: "permanent",
      whose: "you",
      filter: { subtype: "Equipment", anyOf: [{ manaValue: { op: "eq", n: 2 } }, { manaValue: { op: "eq", n: 3 } }] },
    },
  ],
  effect: {
    kind: "may",
    prompt: "Attach the target Equipment to Frodo?",
    effect: { kind: "attach", target: "source", attachment: 0 },
  },
  resolve: null,
  text: ATTACH_TEXT,
});

export default defineCard({
  name: "Frodo, Determined Hero",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ATTACH_TEXT}\n${PREVENT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      replacement: { event: "would-deal-damage", prevent: true, to: "self" },
      text: PREVENT_TEXT,
    },
  ],
  triggered: [attach({ on: "enters-battlefield", who: "self" }), attach({ on: "attacks", who: "self" }, 0)],
});
