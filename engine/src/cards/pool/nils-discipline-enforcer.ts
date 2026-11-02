import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

const END_STEP =
  "At the beginning of your end step, for each player, put a +1/+1 counter on up to one target creature that player controls.";
const TAX =
  "Each creature with one or more counters on it can't attack you or planeswalkers you control unless its controller pays {X}, where X is the number of counters on that creature.";

// One optional slot per seat, 0 (you) to 3 (Demonic Junker's shape). The tax
// is per counter on the attacker, so a creature without one costs nothing,
// and it binds Nils's controller's own creatures only if they could attack
// their controller, which they can't.
const perPlayer = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "creature" } },
});

export default defineCard({
  name: "Nils, Discipline Enforcer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${END_STEP}\n${TAX}`,
  static: [
    {
      affects: { scope: "all-creatures" },
      combatTax: { on: ["attack"], generic: 1, perCounter: "any", covers: "you-and-planeswalkers" },
      text: TAX,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [perPlayer(0), perPlayer(1), perPlayer(2), perPlayer(3)],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 2, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 3, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
