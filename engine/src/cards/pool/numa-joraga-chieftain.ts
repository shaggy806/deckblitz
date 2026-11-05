import { defineCard } from "../define.js";

// EDHREC rank 13415. Paid as the trigger resolves; targets and the division are
// announced as the reflexive ability goes on the stack, at least one each (the
// rulings).
const TEXT =
  "At the beginning of combat on your turn, you may pay {X}{X}. When you do, distribute X +1/+1 counters among any number of target Elves.";

export default defineCard({
  name: "Numa, Joraga Chieftain",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  pairing: { kind: "partner" },
  text: `${TEXT}\nPartner (You can have two commanders if both have partner.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X}{X} to distribute X +1/+1 counters among any number of target Elves?",
        cost: "{X}{X}",
        effect: {
          kind: "reflexive-trigger",
          targets: [{ kind: "any-number", of: { kind: "permanent", filter: { subtype: "Elf" } } }],
          value: "x",
          divided: { total: { triggerValue: true }, slot: 0, of: "+1/+1 counters" },
          effect: { kind: "counters-divided", from: 0, counter: "+1/+1" },
          text: "Distribute X +1/+1 counters among any number of target Elves.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
