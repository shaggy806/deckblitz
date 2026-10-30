import { defineCard } from "../define.js";

// Magic 2011 (M11). "As this creature enters, put a phylactery counter on an
// artifact you control" (rule 614.1c) is `choosePermanentOnEnter` with
// `counter`: with no artifact, no counter goes anywhere and the state
// trigger sacrifices it. That trigger is Barbarian Outcast's shape (rule
// 603.8): it checks permanents with a phylactery counter anyone's put there.

const ENTERS = "As this creature enters, put a phylactery counter on an artifact you control.";
const SAC = "When you control no permanents with phylactery counters on them, sacrifice this creature.";

export default defineCard({
  name: "Phylactery Lich",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 5,
  toughness: 5,
  keywords: ["indestructible"],
  text: `Indestructible\n${ENTERS}\n${SAC}`,
  choosePermanentOnEnter: {
    filter: { type: "artifact", controlledBy: "you" },
    prompt: "Put a phylactery counter on an artifact you control",
    counter: "phylactery",
  },
  triggered: [
    {
      trigger: {
        on: "state",
        state: {
          kind: "not",
          of: { kind: "controls", filter: { counters: { kind: "phylactery", compare: { op: "gte", n: 1 } } }, atLeast: 1 },
        },
      },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SAC,
    },
  ],
});
