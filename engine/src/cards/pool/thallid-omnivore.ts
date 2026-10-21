import { defineCard } from "../define.js";

export default defineCard({
  name: "Thallid Omnivore",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Fungus"],
  power: 3,
  toughness: 3,
  text: "{1}, Sacrifice another creature: This creature gets +2/+2 until end of turn. If a Saproling was sacrificed this way, you gain 2 life.",
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      otherOnly: true,
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: { kind: "sacrificed", filter: { subtype: "Saproling" } },
            then: { kind: "gain-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: "{1}, Sacrifice another creature: This creature gets +2/+2 until end of turn. If a Saproling was sacrificed this way, you gain 2 life.",
    },
  ],
});
