import { defineCard } from "../define.js";

const TEXT = "{1}{G}, {T}: Target creature doesn't untap during its controller's next untap step.";

export default defineCard({
  name: "Elvish Hunter",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0, doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
