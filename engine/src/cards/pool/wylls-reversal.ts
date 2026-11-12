import { defineCard } from "../define.js";

// The roll's result is the d20 plus the greatest power among your creatures
// as it resolves (rule 706.2 — a modifier on the roll). "You may choose new
// targets" changes any number of them, none included (rule 115.7d); the
// copy is `copy-spell`'s, which copies an ability in the slot as an ability
// (rule 707.10).
export default defineCard({
  name: "Wyll's Reversal",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Choose target spell or ability with one or more targets. Roll a d20 and add the greatest power among creatures you control.\n" +
    "1—14 | You may choose new targets for that spell or ability.\n" +
    "15+ | You may choose new targets for that spell or ability. Then copy it. You may choose new targets for the copy.",
  targets: [{ kind: "stack", spells: "any", abilities: true, withTargets: true }],
  effect: {
    kind: "roll-dice",
    sides: 20,
    modifier: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } },
    table: [
      { min: 1, max: 14, effect: { kind: "change-targets", target: 0, how: "choose-new" } },
      {
        min: 15,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "change-targets", target: 0, how: "choose-new" },
            { kind: "copy-spell", target: 0, newTargets: true },
          ],
        },
      },
    ],
  },
});
