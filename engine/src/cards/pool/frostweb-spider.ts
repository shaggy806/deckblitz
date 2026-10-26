import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 17734. Netcaster Spider's trigger, Infernal
// Medusa's end-of-combat delay.
//
// Rulings:
//   [2006-07-15] If Frostweb Spider blocks a creature with flying that's just powerful enough to
//     kill it, it will die before it can get the +1/+1 counter.
//   [2006-07-15] If Frostweb Spider somehow blocks more than one creature with flying during the
//     same combat, its ability will trigger multiple times.

const TEXT = "Whenever this creature blocks a creature with flying, put a +1/+1 counter on this creature at end of combat.";

export default defineCard({
  name: "Frostweb Spider",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 1,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { keyword: "flying" } },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: "end-of-combat",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
        text: "At end of combat, put a +1/+1 counter on this creature.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
