import { defineCard } from "../define.js";

const TEXT = "Prevent all combat damage that would be dealt to this creature.";

export default defineCard({
  name: "Everdawn Champion",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", combat: true, prevent: true, to: "self" },
      text: TEXT,
    },
  ],
});
