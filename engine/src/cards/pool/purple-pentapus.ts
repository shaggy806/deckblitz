import { defineCard } from "../define.js";

// EDHREC rank 15717. The graveyard ability doesn't exile the card as a cost
// (`staysInZone`, as Otharri, Suns' Glory's); the creature is tapped as the
// cost is paid.
const ENTER_TEXT = "When this creature enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)";
const RETURN_TEXT =
  "{2}{B}, Tap an untapped creature you control: Return this card from your graveyard to the battlefield tapped.";

export default defineCard({
  name: "Purple Pentapus",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Octopus", "Starfish"],
  power: 1,
  toughness: 1,
  text: `${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}{B}",
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } },
      },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
