import { defineCard } from "../define.js";

// EDHREC rank 25930.

const TEXT = "Whenever this creature attacks, it doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Apes of Rath",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Ape"],
  power: 5,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
