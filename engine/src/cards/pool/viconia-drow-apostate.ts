import { defineCard } from "../define.js";

const UPKEEP_TEXT =
  "At the beginning of your upkeep, if there are four or more creature cards in your graveyard, return a creature card at random from your graveyard to your hand.";

export default defineCard({
  name: "Viconia, Drow Apostate",
  manaCost: "{2}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${UPKEEP_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "cards-in-graveyard", atLeast: 4, filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "choose-random-card",
        zone: "graveyard",
        filter: { type: "creature" },
        then: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
