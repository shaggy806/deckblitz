import { defineCard } from "../define.js";

const DRAW = "You draw a card and you lose 1 life.";
const DAMAGE = "Riveteers Confluence deals 1 damage to each creature and planeswalker you don't control.";
const LAND = "You may put a land card from your hand or graveyard onto the battlefield tapped.";

export default defineCard({
  name: "Riveteers Confluence",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text: `Choose three. You may choose the same mode more than once.\n• ${DRAW}\n• ${DAMAGE}\n• ${LAND}`,
  targets: [],
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: DRAW,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            { kind: "lose-life", amount: 1 },
          ],
        },
      },
      {
        text: DAMAGE,
        effect: {
          kind: "damage-all",
          amount: 1,
          filter: { typesAnyOf: ["creature", "planeswalker"], controlledBy: "opponent" },
        },
      },
      {
        text: LAND,
        effect: {
          kind: "may",
          prompt: "Put a land card from your hand or graveyard onto the battlefield tapped?",
          effect: {
            kind: "return-from-graveyard",
            filter: { type: "land" },
            destination: "battlefield",
            count: 1,
            from: "hand-or-graveyard",
            enterTapped: true,
          },
        },
      },
    ],
  },
});
