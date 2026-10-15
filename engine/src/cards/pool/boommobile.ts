import type { EffectSpec } from "../../effects.js";
import type { ManaType } from "../../mana.js";
import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this Vehicle enters, add four mana of any one color. Spend this mana only to activate abilities.";
const EXHAUST_TEXT =
  "Exhaust — {X}{2}{R}: This Vehicle deals X damage to any target. Put a +1/+1 counter on this Vehicle.";

const SPEND = { abilityOf: {}, abilityOfAnyZone: true, text: "Spend this mana only to activate abilities." } as const;
const COLORS = ["W", "U", "B", "R", "G"] as const satisfies readonly ManaType[];

// The colour is chosen as the trigger resolves (it isn't a mana ability —
// rule 605.1a), so it's a modal over the five, as Crumbling Vestige's is.
const addFour: EffectSpec = {
  kind: "modal",
  minModes: 1,
  maxModes: 1,
  modes: COLORS.map((c) => ({
    text: `Add {${c}}{${c}}{${c}}{${c}}.`,
    effect: { kind: "add-mana", mana: c, amount: 4, spendOnly: SPEND },
  })),
};

export default defineCard({
  name: "Boommobile",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 5,
  toughness: 5,
  text: `${ENTER_TEXT}\n${EXHAUST_TEXT} (Activate each exhaust ability only once.)\nCrew 2`,
  activated: [
    {
      cost: { mana: "{X}{2}{R}", tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: "x", target: 0 },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: EXHAUST_TEXT,
      exhaust: true,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 2, filter: { type: "creature" } },
      },
      targets: [],
      effect: {
        kind: "add-types",
        target: "source",
        addTypes: ["artifact", "creature"],
        duration: "end-of-turn",
      },
      resolve: null,
      crew: true,
      text: "Crew 2",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: addFour,
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
