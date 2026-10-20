import { defineCard } from "../define.js";

// EDHREC rank 12164.
//
// Putting the land onto the battlefield isn't playing it (the ruling): no
// land drop is used, so a `look-and-choose` from the hand (Llanowar Scout's).

export default defineCard({
  name: "Murasa Rootgrazer",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: "Vigilance\n{T}: You may put a basic land card from your hand onto the battlefield.\n{T}: Return target basic land you control to its owner's hand.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { supertype: "basic", type: "land" },
      },
      resolve: null,
      text: "{T}: You may put a basic land card from your hand onto the battlefield.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { supertype: "basic", type: "land" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{T}: Return target basic land you control to its owner's hand.",
    },
  ],
});
