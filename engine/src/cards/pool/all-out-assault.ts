import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this enchantment enters, if it's your main phase, there is an additional combat phase after this phase followed by an additional main phase. When you next attack this turn, untap each creature you control.";

export default defineCard({
  name: "All-Out Assault",
  manaCost: "{2}{R}{W}{B}",
  colors: ["W", "B", "R"],
  types: ["enchantment"],
  text: `Creatures you control get +1/+1 and have deathtouch.\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPt: [1, 1],
      grantKeywords: ["deathtouch"],
      text: "Creatures you control get +1/+1 and have deathtouch.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "additional-combat", afterThisPhase: true, withMain: true },
          {
            kind: "delayed-trigger",
            at: { whenever: { on: "attack-with", who: "you", atLeast: 1 }, once: true },
            effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
            text: "When you next attack this turn, untap each creature you control.",
          },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
