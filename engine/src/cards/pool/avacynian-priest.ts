import { defineCard } from "../define.js";

// EDHREC rank 21814. Sigardian Priest's ability.

export default defineCard({
  name: "Avacynian Priest",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 2,
  text: "{1}, {T}: Tap target non-Human creature.",
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", notSubtypes: ["Human"] } }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{1}, {T}: Tap target non-Human creature.",
    },
  ],
});
