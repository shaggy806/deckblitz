import { defineCard } from "../define.js";

// EDHREC rank 973.
//
// Each creature counts its own declarations this turn, those before Moraug came
// too, and one entering attacking hasn't attacked (the rulings). The additional
// combat comes straight after this main phase: from the precombat main, before
// the turn's own combat, which gets no untap; from the postcombat main, with no
// main phase after it (the rulings; rule 500.8). "At the beginning of that
// combat" is a delayed ability on that one phase (rule 603.7).

const ANTHEM = "Each creature you control gets +1/+0 for each time it has attacked this turn.";
const LANDFALL =
  "Landfall — Whenever a land you control enters, if it's your main phase, there's an additional combat phase after this phase. At the beginning of that combat, untap all creatures you control.";

export default defineCard({
  name: "Moraug, Fury of Akoum",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Minotaur", "Warrior"],
  power: 6,
  toughness: 6,
  text: `${ANTHEM}\n${LANDFALL}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { ofAffected: "times-attacked-this-turn", pt: [1, 0] },
      text: ANTHEM,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      condition: {
        kind: "all",
        of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["precombat-main", "postcombat-main"] }],
      },
      targets: [],
      effect: {
        kind: "additional-combat",
        afterThisPhase: true,
        atBeginning: {
          effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
          text: "At the beginning of that combat, untap all creatures you control.",
        },
      },
      resolve: null,
      text: LANDFALL,
    },
  ],
});
