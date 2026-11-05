import { defineCard } from "../define.js";

const HIDE = "Run and Hide — Prevent all combat damage that would be dealt to you and creatures you control this turn.";
const COURAGE =
  "Gather Your Courage — Target creature gets +5/+5 and gains indestructible until end of turn. All creatures your opponents control able to block that creature this turn do so.";

export default defineCard({
  name: "You Look Upon the Tarrasque",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["instant"],
  text: `Choose one —\n• ${HIDE}\n• ${COURAGE}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: HIDE,
        effect: {
          kind: "damage-rule",
          to: { players: "you", permanents: { type: "creature", controlledBy: "you" } },
          combat: true,
        },
      },
      {
        text: COURAGE,
        targets: ["creature"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 5, toughness: 5, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
            { kind: "block-if-able", filter: { type: "creature", controlledBy: "opponent" }, attacker: 0 },
          ],
        },
      },
    ],
  },
});
