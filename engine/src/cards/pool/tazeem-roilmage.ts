import { defineCard } from "../define.js";

// EDHREC rank 21867.

const ENTER_TEXT =
  "When this creature enters, if it was kicked, return target instant or sorcery card from your graveyard to your hand.";

export default defineCard({
  name: "Tazeem Roilmage",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: `Kicker {4} (You may pay an additional {4} as you cast this spell.)\n${ENTER_TEXT}`,
  kicker: { cost: "{4}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
