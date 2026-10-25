import { defineCard } from "../define.js";

const TEXT = "{1}, {T}: Tap target non-Human creature.";

export default defineCard({
  name: "Sigardian Priest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Human"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
