import { defineCard } from "../define.js";

const TEXT =
  "When Samwise enters, choose up to one target permanent card in your graveyard that was put there from the battlefield this turn. Return it to your hand. Then the Ring tempts you.";

export default defineCard({
  name: "Samwise the Stouthearted",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Peasant"],
  power: 2,
  toughness: 1,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { notTypes: ["instant", "sorcery"], putIntoGraveyardThisTurn: { from: ["battlefield"] } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [{ kind: "return-to-hand", target: 0, from: "graveyard" }, { kind: "the-ring-tempts-you" }],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
