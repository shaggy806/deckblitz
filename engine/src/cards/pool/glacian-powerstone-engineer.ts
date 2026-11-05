import { defineCard } from "../define.js";

// X is the number of artifacts tapped for the cost, announced as it's
// activated (`tapOthers.count: "x"`) — summoning-sick artifact creatures
// included (the ruling).

const LOOK_TEXT =
  "{T}, Tap X untapped artifacts you control: Look at the top X cards of your library. Put one of those cards into your hand and the rest into your graveyard.";

export default defineCard({
  name: "Glacian, Powerstone Engineer",
  manaCost: "{5}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 6,
  pairing: { kind: "partner" },
  text: `${LOOK_TEXT}\nPartner (You can have two commanders if both have partner.)`,
  activated: [
    {
      cost: { mana: null, tap: true, tapOthers: { count: "x", filter: { type: "artifact", controlledBy: "you" } } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: "x",
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
