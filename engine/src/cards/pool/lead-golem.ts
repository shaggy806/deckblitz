import { defineCard } from "../define.js";

export default defineCard({
  name: "Lead Golem",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 5,
  text: "Whenever this creature attacks, it doesn't untap during its controller's next untap step.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "tap", target: "source", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: "Whenever this creature attacks, it doesn't untap during its controller's next untap step.",
    },
  ],
});
