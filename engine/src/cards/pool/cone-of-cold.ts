import { defineCard } from "../define.js";

const OPPONENTS_CREATURES = { type: "creature", controlledBy: "opponent" } as const;

export default defineCard({
  name: "Cone of Cold",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Roll a d20.\n1—9 | Tap all creatures your opponents control.\n10—19 | Tap all creatures your opponents control. Those creatures don't untap during their controllers' next untap steps.\n20 | Tap all creatures your opponents control. Those creatures don't untap during their controllers' next untap steps. Until your next turn, creatures your opponents control enter tapped.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    table: [
      { min: 1, max: 9, effect: { kind: "tap-all", filter: OPPONENTS_CREATURES } },
      { min: 10, max: 19, effect: { kind: "tap-all", filter: OPPONENTS_CREATURES, doesntUntapNext: true } },
      {
        min: 20,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "tap-all", filter: OPPONENTS_CREATURES, doesntUntapNext: true },
            { kind: "player-effect", duration: "until-your-next-turn", entersTapped: OPPONENTS_CREATURES },
          ],
        },
      },
    ],
  },
});
