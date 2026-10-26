import { defineCard } from "../define.js";

/** 1/1 white and black Cleric that can sacrifice itself to return a card
 * named Deathpact Angel from your graveyard to the battlefield. */
export default defineCard({
  name: "Cleric Token (Deathpact Return)",
  art: "9af74e26-69d7-4683-9a71-9b420c03d75f",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Cleric"],
  power: 1,
  toughness: 1,
  text: "{3}{W}{B}{B}, {T}, Sacrifice this token: Return a card named Deathpact Angel from your graveyard to the battlefield.",
  activated: [
    {
      cost: { mana: "{3}{W}{B}{B}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "return-from-graveyard",
        filter: { name: "Deathpact Angel" },
        destination: "battlefield",
        count: 1,
      },
      resolve: null,
      text: "{3}{W}{B}{B}, {T}, Sacrifice this token: Return a card named Deathpact Angel from your graveyard to the battlefield.",
    },
  ],
});
