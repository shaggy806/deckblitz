import { defineCard } from "../define.js";

export default defineCard({
  name: "Returned Pastcaller",
  manaCost: "{3}{R}{R/W}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 4,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, return target Spirit, instant, or sorcery card from your graveyard to your hand.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { anyOf: [{ subtype: "Spirit" }, { typesAnyOf: ["instant", "sorcery"] }] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "When this creature enters, return target Spirit, instant, or sorcery card from your graveyard to your hand.",
    },
  ],
});
