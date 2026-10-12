import { defineCard } from "../define.js";

export default defineCard({
  name: "Rampaging Spiketail",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 6,
  cycling: { cost: "{2}", search: { subtype: "Swamp" } },
  text: "When this creature enters, target creature you control gets +2/+0 and gains indestructible until end of turn.\nSwampcycling {2} ({2}, Discard this card: Search your library for a Swamp card, reveal it, put it into your hand, then shuffle.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          {
            kind: "grant-keyword",
            target: 0,
            keyword: "indestructible",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature you control gets +2/+0 and gains indestructible until end of turn.",
    },
  ],
});
