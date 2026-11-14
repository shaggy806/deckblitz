import { defineCard } from "../define.js";

// EDHREC rank 8803.
//
// The Ooze enters with its counters (`withCounters`, rule 122.6), so
// whatever sees it enter sees a creature with them, never a 0/0. X is read as
// the ability resolves, before the token exists: every creature you control
// then is "other" than it.

const TEXT =
  "Whenever this creature or another creature you control is turned face up, create a 0/0 green Ooze creature token with trample. The token enters with X +1/+1 counters on it, where X is the number of other creatures you control.";

export default defineCard({
  name: "Printlifter Ooze",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ooze"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  morph: { keyword: "disguise", cost: "{3}{G}" },
  text: `Deathtouch\n${TEXT}\nDisguise {3}{G} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "create-token",
        token: "0/0 Trample Ooze Token",
        count: 1,
        withCounters: { kind: "+1/+1", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
