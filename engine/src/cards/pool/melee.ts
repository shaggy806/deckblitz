import { defineCard } from "../define.js";

// EDHREC rank 29712. Portal Three Kingdoms. "You choose which creatures block
// this combat" is Odric's `choose-combat { thisCombat }`; the last clause is a
// delayed "whenever" for this combat, triggering in the declare blockers step
// for each attacker left unblocked (the ruling).
const UNBLOCKED = "Untap it and remove it from combat.";

export default defineCard({
  name: "Melee",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Cast this spell only during combat on your turn before blockers are declared.\nYou choose which creatures block this combat and how those creatures block.\nWhenever a creature attacks and isn't blocked this combat, untap it and remove it from combat.",
  castOnlyIf: {
    kind: "all",
    of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["begin-combat", "declare-attackers"] }],
  },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "choose-combat", blocks: "all", thisCombat: true },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "attacks-unblocked", who: "any", filter: { type: "creature" } }, until: "until-end-of-combat" },
        effect: {
          kind: "sequence",
          effects: [
            { kind: "untap", target: "trigger-object" },
            { kind: "remove-from-combat", target: "trigger-object" },
          ],
        },
        text: UNBLOCKED,
      },
    ],
  },
});
