import { defineCard } from "../define.js";

// Eldritch Moon. EDHREC rank 15561. The Humans are those you control as the
// trigger resolves, this creature left out.
const TEXT = "When this creature enters, other Humans you control get +1/+1 and gain lifelink until end of turn.";
const HUMANS = { type: "creature", subtype: "Human", controlledBy: "you" } as const;

export default defineCard({
  name: "Heron's Grace Champion",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "lifelink"],
  text: `Flash\nLifelink\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: HUMANS, power: 1, toughness: 1, duration: "end-of-turn", exceptSource: true },
          { kind: "grant-keyword-all", filter: HUMANS, keyword: "lifelink", duration: "end-of-turn", exceptSource: true },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
