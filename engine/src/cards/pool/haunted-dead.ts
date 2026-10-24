import { defineCard } from "../define.js";

const RETURN_TEXT = "{1}{B}, Discard two cards: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Haunted Dead",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 2,
  text: `When this creature enters, create a 1/1 white Spirit creature token with flying.\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a 1/1 white Spirit creature token with flying.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 2 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
