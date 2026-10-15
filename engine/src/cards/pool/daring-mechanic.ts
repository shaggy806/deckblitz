import { defineCard } from "../define.js";

// EDHREC rank 23598. Any player's Mount or Vehicle, a creature or not.

export default defineCard({
  name: "Daring Mechanic",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: "{3}{W}: Put a +1/+1 counter on target Mount or Vehicle.",
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [{ kind: "permanent", filter: { anyOf: [{ subtype: "Mount" }, { subtype: "Vehicle" }] } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{3}{W}: Put a +1/+1 counter on target Mount or Vehicle.",
    },
  ],
});
