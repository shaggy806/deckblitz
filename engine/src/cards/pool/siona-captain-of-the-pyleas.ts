import { defineCard } from "../define.js";

// EDHREC rank 9443.
const ENTER_TEXT =
  "When Siona enters, look at the top seven cards of your library. You may reveal an Aura card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const ATTACH_TEXT = "Whenever an Aura you control becomes attached to a creature you control, create a 1/1 white Human Soldier creature token.";

export default defineCard({
  name: "Siona, Captain of the Pyleas",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${ATTACH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 7,
        min: 0,
        max: 1,
        filter: { subtype: "Aura" },
        destination: "hand",
        leftover: "bottom-random",
        reveal: "chosen",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: {
        on: "becomes-attached",
        attachment: { subtype: "Aura", controlledBy: "you" },
        filter: { type: "creature", controlledBy: "you" },
      },
      targets: [],
      effect: { kind: "create-token", token: "Human Soldier Token", count: 1 },
      resolve: null,
      text: ATTACH_TEXT,
    },
  ],
});
