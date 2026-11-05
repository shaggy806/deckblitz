import { defineCard } from "../define.js";


export default defineCard({
  name: "Windreaver",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{W}: This creature gains vigilance until end of turn.\n{W}: This creature gets +0/+1 until end of turn.\n{U}: Switch this creature's power and toughness until end of turn.\n{U}: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "vigilance",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: This creature gains vigilance until end of turn.",
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{W}: This creature gets +0/+1 until end of turn.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", target: "source", duration: "end-of-turn" },
      resolve: null,
      text: "{U}: Switch this creature's power and toughness until end of turn.",
    },
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{U}: Return this creature to its owner's hand.",
    },
  ],
});
