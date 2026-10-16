import { defineCard } from "../define.js";
import type { EffectSpec } from "../../effects.js";

const COLLECT_TEXT =
  "Whenever Izoni enters or attacks, you may collect evidence 4. If you do, create two 2/1 black and green Spider creature tokens with reach and menace.";
const SACRIFICE_TEXT = "Sacrifice four tokens: Surveil 2, then draw two cards. You gain 2 life.";

// One ability with two trigger events (Benthic Criminologists' shape).
const COLLECT: EffectSpec = {
  kind: "collect-evidence",
  amount: 4,
  then: { kind: "create-token", token: "2/1 Black Green Spider Token (Menace, Reach)", count: 2 },
};

export default defineCard({
  name: "Izoni, Center of the Web",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Detective"],
  power: 5,
  toughness: 4,
  keywords: ["menace"],
  text: `Menace\n${COLLECT_TEXT} (To collect evidence 4, exile cards with total mana value 4 or greater from your graveyard.)\n${SACRIFICE_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: COLLECT, resolve: null, text: COLLECT_TEXT },
    {
      trigger: { on: "attacks", who: "self" },
      sameAbilityAs: 0,
      targets: [],
      effect: COLLECT,
      resolve: null,
      text: COLLECT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { token: true }, count: 4 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "surveil", amount: 2 },
          { kind: "draw", amount: 2 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
});
