import { defineCard } from "../define.js";

const TEXT =
  "{T}: All damage that would be dealt to target creature this turn by a source of your choice is dealt to this creature instead.";

export default defineCard({
  name: "Oracle's Attendants",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "all", redirectTo: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
