import { defineCard } from "../define.js";

export default defineCard({
  name: "Dwarven Blastminer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf"],
  power: 1,
  toughness: 1,
  morph: { keyword: "morph", cost: "{R}" },
  text: "{2}{R}, {T}: Destroy target nonbasic land.\nMorph {R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)",
  activated: [
    {
      cost: { mana: "{2}{R}", tap: true },
      targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{2}{R}, {T}: Destroy target nonbasic land.",
    },
  ],
});
