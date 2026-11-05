import { defineCard } from "../define.js";

// EDHREC rank 7016.

export default defineCard({
  name: "Kaalia, Zenith Seeker",
  manaCost: "{R}{W}{B}",
  colors: ["W", "B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "vigilance"],
  text: "Flying, vigilance\nWhen Kaalia enters, look at the top six cards of your library. You may reveal an Angel card, a Demon card, and/or a Dragon card from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 3,
        together: {
          oneEach: [
            { label: "an Angel card", filter: { subtype: "Angel" } },
            { label: "a Demon card", filter: { subtype: "Demon" } },
            { label: "a Dragon card", filter: { subtype: "Dragon" } },
          ],
          text: "an Angel card, a Demon card, and/or a Dragon card",
        },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: "When Kaalia enters, look at the top six cards of your library. You may reveal an Angel card, a Demon card, and/or a Dragon card from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
    },
  ],
});
