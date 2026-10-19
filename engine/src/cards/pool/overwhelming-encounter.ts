import { defineCard } from "../define.js";

// EDHREC rank 11415.
// The keyword grants, then Contraband Livestock's d20 table.

const YOURS = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Overwhelming Encounter",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Creatures you control gain vigilance and trample until end of turn. Roll a d20.\n1—9 | Creatures you control get +2/+2 until end of turn.\n10—19 | Put two +1/+1 counters on each creature you control.\n20 | Put four +1/+1 counters on each creature you control.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword-all", filter: YOURS, keyword: "vigilance", duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: YOURS, keyword: "trample", duration: "end-of-turn" },
      {
        kind: "roll-dice",
        sides: 20,
        table: [
          {
            min: 1,
            max: 9,
            effect: { kind: "modify-pt-all", filter: YOURS, power: 2, toughness: 2, duration: "end-of-turn" },
          },
          { min: 10, max: 19, effect: { kind: "add-counter-all", filter: YOURS, counter: "+1/+1", amount: 2 } },
          { min: 20, effect: { kind: "add-counter-all", filter: YOURS, counter: "+1/+1", amount: 4 } },
        ],
      },
    ],
  },
});
