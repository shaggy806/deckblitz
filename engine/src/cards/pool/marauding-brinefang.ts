import { defineCard } from "../define.js";

export default defineCard({
  name: "Marauding Brinefang",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 7,
  cycling: { cost: "{2}", search: { subtype: "Island" } },
  text: "Ward {3} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {3}.)\nIslandcycling {2} ({2}, Discard this card: Search your library for an Island card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{3}" } },
      resolve: null,
      text: "Ward {3}",
    },
  ],
});
