import { defineCard } from "../define.js";

const DAMAGE_MODE =
  "Cabaretti Charm deals damage equal to the number of creatures you control to target creature or planeswalker.";
const PUMP_MODE = "Creatures you control get +1/+1 and gain trample until end of turn.";
const TOKEN_MODE = "Create two 1/1 green and white Citizen creature tokens.";

export default defineCard({
  name: "Cabaretti Charm",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["instant"],
  text: `Choose one —\n• ${DAMAGE_MODE}\n• ${PUMP_MODE}\n• ${TOKEN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DAMAGE_MODE,
        targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
        // Counted as it resolves (rule 608.2h).
        effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
      },
      {
        text: PUMP_MODE,
        // Only the creatures you control as it resolves (rule 611.2c).
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "modify-pt-all",
              filter: { type: "creature", controlledBy: "you" },
              power: 1,
              toughness: 1,
              duration: "end-of-turn",
            },
            {
              kind: "grant-keyword-all",
              filter: { type: "creature", controlledBy: "you" },
              keyword: "trample",
              duration: "end-of-turn",
            },
          ],
        },
      },
      {
        text: TOKEN_MODE,
        effect: { kind: "create-token", token: "Citizen Token", count: 2 },
      },
    ],
  },
});
