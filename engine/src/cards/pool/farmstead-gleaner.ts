import { defineCard } from "../define.js";

export default defineCard({
  name: "Farmstead Gleaner",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Scarecrow"],
  power: 2,
  toughness: 2,
  text: "This creature doesn't untap during your untap step.\n{2}, {Q}: Put a +1/+1 counter on this creature. ({Q} is the untap symbol.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false, untap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "{2}, {Q}: Put a +1/+1 counter on this creature.",
    },
  ],
  static: [{ affects: { scope: "self" }, doesntUntap: true, text: "This creature doesn't untap during your untap step." }],
});
