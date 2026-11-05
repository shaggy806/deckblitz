import { defineCard } from "../define.js";

const LANDS = "{1}: Put up to two land cards from your hand onto the battlefield tapped.";

export default defineCard({
  name: "Patron of the Moon",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  kicker: { cost: "", keyword: "offering", flash: true, offering: { subtype: "Moonfolk" } },
  text: `Moonfolk offering (You may cast this spell any time you could cast an instant by sacrificing a Moonfolk and paying the difference in mana costs between this and the sacrificed Moonfolk. Mana cost includes color.)\nFlying\n${LANDS}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 2,
        filter: { type: "land" },
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
      },
      resolve: null,
      text: LANDS,
    },
  ],
});
