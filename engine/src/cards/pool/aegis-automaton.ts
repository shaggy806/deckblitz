import { defineCard } from "../define.js";

const BOUNCE = "{4}{W}: Return another target creature you control to its owner's hand.";

export default defineCard({
  name: "Aegis Automaton",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 0,
  toughness: 3,
  text: BOUNCE,
  activated: [
    {
      cost: { mana: "{4}{W}", tap: false },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: BOUNCE,
    },
  ],
});
