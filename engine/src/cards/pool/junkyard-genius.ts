import { defineCard } from "../define.js";

// The Brothers' War. The other creatures are the ones you control as the
// ability resolves (rule 611.2c): both mass effects lock their set then.
const ENTERS_TEXT = "When this creature enters, create a tapped Powerstone token.";
const PUMP_TEXT =
  "{1}{B}{R}, Sacrifice another creature or artifact: Until end of turn, other creatures you control get +1/+0 and gain menace and haste.";

export default defineCard({
  name: "Junkyard Genius",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 2,
  text:
    `${ENTERS_TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")\n` +
    PUMP_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}{R}", tap: false, sacrifice: { filter: { typesAnyOf: ["creature", "artifact"] } } },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "menace",
            duration: "end-of-turn",
            exceptSource: true,
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
            exceptSource: true,
          },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
