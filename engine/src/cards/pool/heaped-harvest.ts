import type { TriggeredAbility } from "../../abilities.js";
import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// "When this enters and when you sacrifice it" is two triggered abilities;
// the sacrifice one fires however it was sacrificed (the ruling).
const TRIGGER_TEXT =
  "When this artifact enters and when you sacrifice it, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle.";
const FOOD_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";

const search: EffectSpec = {
  kind: "may",
  prompt: "Search your library for a basic land card?",
  effect: {
    kind: "search-library",
    filter: { supertype: "basic", type: "land" },
    destination: "battlefield",
    min: 0,
    max: 1,
    enterTapped: true,
  },
};

const triggers: TriggeredAbility[] = [
  { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: search, resolve: null, text: TRIGGER_TEXT },
  { trigger: { on: "sacrifice", who: "you", selfOnly: true }, targets: [], effect: search, resolve: null, text: TRIGGER_TEXT },
];

export default defineCard({
  name: "Heaped Harvest",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Food"],
  text: `${TRIGGER_TEXT}\n${FOOD_TEXT}`,
  triggered: triggers,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 3 },
      resolve: null,
      text: FOOD_TEXT,
    },
  ],
});
