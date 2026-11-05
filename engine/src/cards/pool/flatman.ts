import { defineCard } from "../define.js";


export default defineCard({
  name: "Flatman",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Hero"],
  power: 1,
  toughness: 10,
  text: "Origami-Fu — {2}{G}: Switch Flatman's power and toughness until end of turn.",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "Origami-Fu — {2}{G}: Switch Flatman's power and toughness until end of turn.",
    },
  ],
});
