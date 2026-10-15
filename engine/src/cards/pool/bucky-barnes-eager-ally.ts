import { defineCard } from "../define.js";

// EDHREC rank 22347.
const DIES_TEXT =
  "When Bucky Barnes dies, look at the top four cards of your library. You may reveal an Equipment, Hero, or Soldier card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Bucky Barnes, Eager Ally",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ subtype: "Equipment" }, { subtype: "Hero" }, { subtype: "Soldier" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
