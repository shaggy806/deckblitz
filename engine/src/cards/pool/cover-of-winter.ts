import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Coldsnap (CSP).
//
// Rulings:
//   If multiple creatures would deal combat damage to you and your creatures at the same time,
//     this prevents X of the damage that would be dealt by each of them, creature by creature.
//   If a creature has double strike, Cover of Winter prevents X of the combat damage it would
//     deal during each combat damage step.
//   If a creature's combat damage is assigned to multiple recipients, you decide how to divide
//     the prevention effect, as long as the total prevented of that creature's damage is X.
//
// The prevention is `prevent: { count }` with `perSourceTo`: each combat damage step, every
// creature about to deal combat damage gets a shield of X over you and the creatures you control
// (rule 615.7), divided by you through the shield-share question.

const UPKEEP_TEXT =
  "Cumulative upkeep {S} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it. {S} can be paid with one mana from a snow source.)";
const PREVENT_TEXT =
  "If a creature would deal combat damage to you and/or one or more creatures you control, prevent X of that damage, where X is the number of age counters on this enchantment.";
const AGE_TEXT = "{S}: Put an age counter on this enchantment.";

export default defineCard({
  name: "Cover of Winter",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["snow"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${PREVENT_TEXT}\n${AGE_TEXT}`,
  triggered: [cumulativeUpkeep("{S}")],
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        source: { type: "creature" },
        instead: {
          prevent: { count: { countersOn: "source", counter: "age" } },
          perSourceTo: { players: "you", permanents: { type: "creature", controlledBy: "you" } },
        },
      },
      text: PREVENT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{S}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "age", amount: 1 },
      resolve: null,
      text: AGE_TEXT,
    },
  ],
});
