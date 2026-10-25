import { defineCard } from "../define.js";

// EDHREC rank 15561. "Other Humans you control" is read once as the trigger
// resolves: a Human arriving later this turn gets neither.

const ETB_TEXT = "When this creature enters, other Humans you control get +1/+1 and gain lifelink until end of turn.";
const OTHER_HUMANS = { type: "creature", subtype: "Human", controlledBy: "you" } as const;

export default defineCard({
  name: "Heron's Grace Champion",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "lifelink"],
  text: `Flash\nLifelink\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: OTHER_HUMANS, power: 1, toughness: 1, duration: "end-of-turn", exceptSource: true },
          { kind: "grant-keyword-all", filter: OTHER_HUMANS, keyword: "lifelink", duration: "end-of-turn", exceptSource: true },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
