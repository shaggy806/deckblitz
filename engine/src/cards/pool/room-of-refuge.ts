import { defineCard } from "../define.js";

// EDHREC rank 23035.
// Uncharted Haven's land with Captivating Cave's sacrifice ability.
export default defineCard({
  name: "Room of Refuge",
  colors: [],
  types: ["land"],
  text: "This land enters tapped. As it enters, choose a color.\n{T}: Add one mana of the chosen color.\n{5}, {T}, Sacrifice this land: Put two +1/+1 counters on target creature. Activate only as a sorcery.",
  chooseOnEnter: ["W", "U", "B", "R", "G"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "chosen", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of the chosen color.",
    },
    {
      cost: { mana: "{5}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "{5}, {T}, Sacrifice this land: Put two +1/+1 counters on target creature. Activate only as a sorcery.",
      sorcerySpeed: true,
    },
  ],
});
