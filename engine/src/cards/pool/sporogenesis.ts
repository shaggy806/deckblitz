import { defineCard } from "../define.js";

// EDHREC rank 18169.
//
// Rulings:
//   [2004-10-04] If more than one Sporogenesis is on the battlefield and a creature with fungus
//     counters on it leaves the battlefield, each Sporogenesis will put a Saproling onto the
//     battlefield for each counter.
//   [2004-10-04] If one Sporogenesis leaves the battlefield, all fungus counters are removed even
//     if other Sporogenesis cards are on the battlefield.
//   [2004-10-04] Adding a counter is optional.
//   [2004-10-04] If a non-creature with fungus counters on it leaves the battlefield, there is no
//     effect.
//
// The dead creature's fungus counters are read as it last existed on the
// battlefield (rule 603.10a — the trigger object's last-known counters).
const UPKEEP_TEXT = "At the beginning of your upkeep, you may put a fungus counter on target nontoken creature.";
const DIES_TEXT =
  "Whenever a creature with a fungus counter on it dies, create a 1/1 green Saproling creature token for each fungus counter on that creature.";
const LEAVE_TEXT = "When this enchantment leaves the battlefield, remove all fungus counters from all creatures.";

export default defineCard({
  name: "Sporogenesis",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${UPKEEP_TEXT}\n${DIES_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [{ kind: "permanent", filter: { type: "creature", token: false } }],
      effect: {
        kind: "may",
        prompt: "Put a fungus counter on target nontoken creature?",
        effect: { kind: "add-counter", target: 0, counter: "fungus", amount: 1 },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: {
        on: "dies",
        who: "any",
        filter: { type: "creature", counters: { kind: "fungus", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Saproling Token",
        count: { countersOn: "trigger-object", counter: "fungus" },
      },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "remove-counter-all", filter: { type: "creature" }, counter: "fungus", amount: "all" },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
