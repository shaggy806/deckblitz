import { defineCard } from "../define.js";

// Mirrodin.
//
// The player is found as the trigger resolves, among every player still in
// the game, its controller included (`choose-opponent` with `anyPlayer` and
// `leastLife`): one alone takes it without a question, and a tie is the
// controller's choice among the tied. If that's its controller already, the
// control change does nothing.

const UPKEEP =
  "At the beginning of your upkeep, the player with the lowest life total gains control of this creature. If two or more players are tied for lowest life total, you choose one of them, and that player gains control of this creature.";

export default defineCard({
  name: "Loxodon Peacekeeper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Soldier"],
  power: 4,
  toughness: 4,
  text: UPKEEP,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "choose-opponent",
        anyPlayer: true,
        leastLife: true,
        then: { kind: "gain-control", target: "source", who: "that-player", untilEndOfTurn: false },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
