import { defineCard } from "../define.js";

export default defineCard({
  name: "Mistform Wakecaster",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{1}: This creature becomes the creature type of your choice until end of turn.\n{2}{U}{U}, {T}: Choose a creature type. Each creature you control becomes that type until end of turn.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: { kind: "become", target: "source", setSubtypes: ["$chosen"], duration: "end-of-turn" },
      },
      resolve: null,
      text: "{1}: This creature becomes the creature type of your choice until end of turn.",
    },
    {
      cost: { mana: "{2}{U}{U}", tap: true },
      targets: [],
      effect: {
        kind: "choose-creature-type",
        then: {
          kind: "for-each-permanent",
          filter: { type: "creature", controlledBy: "you" },
          simultaneous: true,
          effect: { kind: "become", target: 0, setSubtypes: ["$chosen"], duration: "end-of-turn" },
        },
      },
      resolve: null,
      text: "{2}{U}{U}, {T}: Choose a creature type. Each creature you control becomes that type until end of turn.",
    },
  ],
});
