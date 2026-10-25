import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Worldwake (WWK). EDHREC rank 12245.
//
// "This creature or another Ally" is two triggers (`thisOrAnother`), so its
// own entry counts even if it somehow isn't an Ally.
const TEXT = "Whenever this creature or another Ally you control enters, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Hada Freeblade",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 0,
  toughness: 1,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Hada Freeblade?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
