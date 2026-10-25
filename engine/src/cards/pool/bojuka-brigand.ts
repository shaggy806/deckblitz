import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 25181.

const TEXT =
  "Whenever this creature or another Ally you control enters, you may put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Bojuka Brigand",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 1,
  toughness: 1,
  text: `This creature can't block.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put a +1/+1 counter on Bojuka Brigand?",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
