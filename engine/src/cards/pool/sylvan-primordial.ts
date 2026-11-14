import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// Rulings:
//   You search and shuffle your library only once.
//   If one of the target noncreature permanents isn't destroyed (indestructible, regenerated),
//     it won't count toward the number of Forest cards you can put onto the battlefield.
//   If an opponent has any legal permanents to target, you must target one of them.
//
// "For each opponent, destroy target noncreature permanent that player controls": one required
// slot a seat (Blatant Thievery's shape). A seat past the table or whose player has left needs
// none (`emptySeatOptional`); an opponent still in the game with no noncreature permanent leaves
// the trigger with no legal targets (rule 603.3d, Vaevictis Asmadi's ruling). The destroys are
// one instruction, all at once; X counts only what was actually destroyed this way.
const ofOpponent = (seat: number): TargetSpec => ({
  kind: "permanent",
  whose: { seat },
  filter: { notTypes: ["creature"] },
});

const ETB_TEXT =
  "When this creature enters, for each opponent, destroy target noncreature permanent that player controls. Search your library for up to X Forest cards, where X is the number of permanents destroyed this way, put those cards onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Sylvan Primordial",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 8,
  keywords: ["reach"],
  text: `Reach\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [ofOpponent(1), ofOpponent(2), ofOpponent(3)],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "sequence",
            simultaneous: true,
            effects: [
              { kind: "destroy", target: 0 },
              { kind: "destroy", target: 1 },
              { kind: "destroy", target: 2 },
            ],
          },
          {
            kind: "search-library",
            filter: { subtype: "Forest" },
            min: 0,
            max: { thisWay: "destroyed" },
            destination: "battlefield",
            enterTapped: true,
          },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
