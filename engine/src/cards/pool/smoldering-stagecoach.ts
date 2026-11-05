import { defineCard } from "../define.js";
import { crew } from "../helpers.js";
import type { EffectSpec } from "../../effects.js";

const POWER_TEXT = "Smoldering Stagecoach's power is equal to the number of instant and sorcery cards in your graveyard.";
const ATTACK_TEXT =
  "Whenever this Vehicle attacks, the next instant spell and the next sorcery spell you cast this turn each have cascade.";

// Each grant is used up by its own next matching spell (rule 601.2i); the
// cascade is the spell's own cast trigger, so it reads that spell's mana value.
const cascadeNext = (type: "instant" | "sorcery"): EffectSpec => ({
  kind: "grant-spells-this-turn",
  next: true,
  filter: { type },
  triggered: [{ trigger: { on: "this-cast" }, targets: [], effect: { kind: "cascade" }, resolve: null, text: "Cascade" }],
});

export default defineCard({
  name: "Smoldering Stagecoach",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 0,
  toughness: 5,
  text: `${POWER_TEXT}\n${ATTACK_TEXT}\nCrew 2`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countInGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" } },
        plusPower: 0,
        plusToughness: 0,
        only: "power",
      },
      text: POWER_TEXT,
    },
  ],
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sequence", effects: [cascadeNext("instant"), cascadeNext("sorcery")] },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
