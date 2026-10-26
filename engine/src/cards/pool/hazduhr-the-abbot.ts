import { defineCard } from "../define.js";

// EDHREC rank 30459.

export default defineCard({
  name: "Hazduhr the Abbot",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 5,
  text: "{X}, {T}: The next X damage that would be dealt this turn to target white creature you control is dealt to Hazduhr instead.",
  activated: [
    {
      cost: { mana: "{X}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", colors: ["W"] } }],
      // Rule 614.9: a redirection.
      effect: { kind: "prevent-damage", target: 0, amount: "x", redirectTo: "source" },
      resolve: null,
      text: "{X}, {T}: The next X damage that would be dealt this turn to target white creature you control is dealt to Hazduhr instead.",
    },
  ],
});
