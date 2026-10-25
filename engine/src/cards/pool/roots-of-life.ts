import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 20368. Lifeblood / Lifetap, one trigger per land type, each
// live only for the type chosen as this entered (Prism Ring's whileCondition).

const TEXT = "Whenever a land of the chosen type an opponent controls becomes tapped, you gain 1 life.";

const triggered: TriggeredAbility[] = (["Island", "Swamp"] as const).map((type) => ({
  trigger: { on: "becomes-tapped", who: "any", filter: { type: "land", subtype: type, controlledBy: "opponent" } },
  whileCondition: { kind: "chosen-on-enter", value: type },
  targets: [],
  effect: { kind: "gain-life", amount: 1 },
  resolve: null,
  text: TEXT,
}));

export default defineCard({
  name: "Roots of Life",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `As this enchantment enters, choose Island or Swamp.\n${TEXT}`,
  chooseOnEnter: ["Island", "Swamp"],
  triggered,
});
