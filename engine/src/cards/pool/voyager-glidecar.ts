import { defineCard } from "../define.js";

const FLY_TEXT =
  "Tap three other untapped creatures you control: Until end of turn, this Vehicle becomes an artifact creature and gains flying. Put a +1/+1 counter on it.";

export default defineCard({
  name: "Voyager Glidecar",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  text: `When this Vehicle enters, scry 1.\n${FLY_TEXT}\nCrew 1`,
  activated: [
    {
      // "Other": tapOthers never counts the source unless `includeSelf`.
      cost: { mana: null, tap: false, tapOthers: { count: 3, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-types", target: "source", addTypes: ["artifact", "creature"], duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: FLY_TEXT,
    },
    {
      cost: {
        mana: null,
        tap: false,
        tapOthers: { count: 0, totalPower: 1, filter: { type: "creature" } },
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
      text: "Crew 1",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1 },
      resolve: null,
      text: "When this Vehicle enters, scry 1.",
    },
  ],
});
