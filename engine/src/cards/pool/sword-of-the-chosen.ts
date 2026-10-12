import { defineCard } from "../define.js";

export default defineCard({
  name: "Sword of the Chosen",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{T}: Target legendary creature gets +2/+2 until end of turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { supertype: "legendary", type: "creature" } }],
      effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{T}: Target legendary creature gets +2/+2 until end of turn.",
    },
  ],
});
