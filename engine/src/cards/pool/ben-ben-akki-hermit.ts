import { defineCard } from "../define.js";

// Champions of Kamigawa. The untapped Mountains are counted as the ability
// resolves.

export default defineCard({
  name: "Ben-Ben, Akki Hermit",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 1,
  toughness: 1,
  text: "{T}: Ben-Ben deals damage to target attacking creature equal to the number of untapped Mountains you control.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "damage",
        target: 0,
        amount: { countOf: { subtype: "Mountain", controlledBy: "you", tapped: false } },
      },
      resolve: null,
      text: "{T}: Ben-Ben deals damage to target attacking creature equal to the number of untapped Mountains you control.",
    },
  ],
});
