import { defineCard } from "../define.js";

// EDHREC rank 8183.
//
// "Creature or Spacecraft card": a Spacecraft card is an artifact (a creature
// only on the battlefield at its station threshold), so it's matched by subtype.

const RETURN_TEXT =
  "{3}{B}{G}, Sacrifice this creature: Return target creature or Spacecraft card from your graveyard to the battlefield. Activate only as a sorcery.";

export default defineCard({
  name: "Seedship Broodtender",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Insect", "Citizen"],
  power: 2,
  toughness: 3,
  text: `When this creature enters, mill three cards. (Put the top three cards of your library into your graveyard.)\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{B}{G}", tap: false, sacrifice: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 3 },
      resolve: null,
      text: "When this creature enters, mill three cards.",
    },
  ],
});
