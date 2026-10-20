import { defineCard } from "../define.js";

const LIFE_TEXT = "Your opponents can't gain life.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, Quakebringer deals 2 damage to each opponent. This ability triggers only if Quakebringer is on the battlefield or if Quakebringer is in your graveyard and you control a Giant.";

export default defineCard({
  name: "Quakebringer",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Berserker"],
  power: 5,
  toughness: 4,
  text: `${LIFE_TEXT}\n${UPKEEP_TEXT}\nForetell {2}{R}{R} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)`,
  static: [
    { affects: { scope: "self" }, replacement: { event: "would-gain-life", who: "opponent", prevent: true }, text: LIFE_TEXT },
  ],
  // One ability, written once per zone it works in: on the battlefield it
  // always triggers (the ruling — even if Quakebringer is no longer a Giant);
  // in your graveyard only while you control a Giant. "Triggers only if" is a
  // trigger condition (rule 603.1), not an intervening "if": it isn't asked
  // again as the ability resolves, so it's `whileCondition`.
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      fromGraveyard: true,
      whileCondition: { kind: "controls", filter: { subtype: "Giant" }, atLeast: 1 },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  foretell: { cost: "{2}{R}{R}" },
});
