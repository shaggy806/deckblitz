import { defineCard } from "../define.js";

const LAND_TEXT =
  "Whenever a creature you control explores a land card, you may put a land card from your hand onto the battlefield tapped.";
const NONLAND_TEXT = "Whenever a creature you control explores a nonland card, put a +1/+1 counter on Nicanzil.";

export default defineCard({
  name: "Nicanzil, Current Conductor",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Scout"],
  power: 2,
  toughness: 3,
  text: `${LAND_TEXT}\n${NONLAND_TEXT}`,
  triggered: [
    {
      // The card as it was revealed (the ruling). Any land card from hand,
      // the explored one included.
      trigger: { on: "explores", who: "you", filter: { type: "creature" }, revealed: "land" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: LAND_TEXT,
    },
    {
      trigger: { on: "explores", who: "you", filter: { type: "creature" }, revealed: "nonland" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: NONLAND_TEXT,
    },
  ],
});
