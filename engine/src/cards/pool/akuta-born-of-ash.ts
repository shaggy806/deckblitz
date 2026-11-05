import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of your upkeep, if you have more cards in hand than each opponent, you may sacrifice a Swamp. If you do, return Akuta from your graveyard to the battlefield.";

export default defineCard({
  name: "Akuta, Born of Ash",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "player-compare", stat: "hand", compare: "more", than: "each-opponent" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Swamp" }, text: "Sacrifice a Swamp" }],
        ifDid: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
