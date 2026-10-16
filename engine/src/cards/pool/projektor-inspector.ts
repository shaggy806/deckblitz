import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// One ability with three trigger events ("whenever A and whenever B"), written
// as three entries counted as one (`sameAbilityAs`): this creature entering
// (whatever its types), another Detective you control entering, and a
// Detective you control being turned face up — this one too, if it was face
// down (rule 708.8).

const TEXT =
  "Whenever this creature or another Detective you control enters and whenever a Detective you control is turned face up, you may draw a card. If you do, discard a card.";

const LOOT: EffectSpec = {
  kind: "may",
  prompt: "Draw a card, then discard a card?",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "drawn", who: "you" },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
};

export default defineCard({
  name: "Projektor Inspector",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Detective" }, otherOnly: true },
      sameAbilityAs: 0,
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { subtype: "Detective" } },
      sameAbilityAs: 0,
      targets: [],
      effect: LOOT,
      resolve: null,
      text: TEXT,
    },
  ],
});
