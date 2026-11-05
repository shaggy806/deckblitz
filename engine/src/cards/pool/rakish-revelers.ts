import { defineCard } from "../define.js";

// EDHREC rank 22750.
// Makes Citizen → use "Citizen Token".

export default defineCard({
  name: "Rakish Revelers",
  manaCost: "{2}{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Druid", "Rogue"],
  power: 5,
  toughness: 3,
  text: "When this creature enters, create a 1/1 green and white Citizen creature token.\n{2}, Exile this card from your hand: Target land gains \"{T}: Add {R}, {G}, or {W}\" until this card is cast from exile. You may cast this card for as long as it remains exiled.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["land"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "grant-activated",
            target: 0,
            ability: {
              cost: { mana: null, tap: true },
              targets: [],
              effect: { kind: "add-mana", mana: { oneOf: ["R", "G", "W"] }, amount: 1 },
              resolve: null,
              text: "{T}: Add {R}, {G}, or {W}.",
            },
            duration: "until-source-cast",
          },
          { kind: "allow-cast-from-exile", target: "source", whileExiled: true },
        ],
      },
      resolve: null,
      text: "{2}, Exile this card from your hand: Target land gains \"{T}: Add {R}, {G}, or {W}\" until this card is cast from exile. You may cast this card for as long as it remains exiled.",
      zone: "hand",
      exilesFromHand: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 green and white Citizen creature token.",
    },
  ],
});
