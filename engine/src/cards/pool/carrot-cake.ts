import type { TriggeredAbility } from "../../abilities.js";
import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// "When this enters and when you sacrifice it" is two triggered abilities;
// the sacrifice one fires however it was sacrificed — its own Food ability,
// forage, anything (the ruling).
const TRIGGER_TEXT =
  "When this artifact enters and when you sacrifice it, create a 1/1 white Rabbit creature token and scry 1. (Look at the top card of your library. You may put that card on the bottom.)";
const FOOD_TEXT = "{2}, {T}, Sacrifice this artifact: You gain 3 life.";

const rabbit: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "create-token", token: "Rabbit Token", count: 1 },
    { kind: "scry", amount: 1 },
  ],
};

const triggers: TriggeredAbility[] = [
  { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: rabbit, resolve: null, text: TRIGGER_TEXT },
  { trigger: { on: "sacrifice", who: "you", selfOnly: true }, targets: [], effect: rabbit, resolve: null, text: TRIGGER_TEXT },
];

export default defineCard({
  name: "Carrot Cake",
  manaCost: "{1}{W}",
  colors: ["W"],
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
