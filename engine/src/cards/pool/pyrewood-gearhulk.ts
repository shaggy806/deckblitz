import { defineCard } from "../define.js";

// EDHREC rank 8423.

const TEXT =
  "When this creature enters, other creatures you control get +2/+2 and gain vigilance and menace until end of turn. Damage can't be prevented this turn.";

const OTHERS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Pyrewood Gearhulk",
  manaCost: "{2}{R}{R}{G}{G}",
  colors: ["R", "G"],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 7,
  toughness: 7,
  keywords: ["vigilance", "menace"],
  text: `Vigilance, menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: OTHERS, power: 2, toughness: 2, duration: "end-of-turn", exceptSource: true },
          { kind: "grant-keyword-all", filter: OTHERS, keyword: "vigilance", duration: "end-of-turn", exceptSource: true },
          { kind: "grant-keyword-all", filter: OTHERS, keyword: "menace", duration: "end-of-turn", exceptSource: true },
          { kind: "damage-cant-be-prevented" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
