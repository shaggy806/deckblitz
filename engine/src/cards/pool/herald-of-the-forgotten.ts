import { defineCard } from "../define.js";

// EDHREC rank 12998. "Any number of target permanent cards with cycling
// abilities" is one any-number group over your graveyard; they return as one
// event (`simultaneous`).

export default defineCard({
  name: "Herald of the Forgotten",
  manaCost: "{6}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, if you cast it, return any number of target permanent cards with cycling abilities from your graveyard to the battlefield.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      targets: [
        {
          kind: "any-number",
          of: {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { notTypes: ["instant", "sorcery"], hasCycling: true },
          },
        },
      ],
      effect: {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, if you cast it, return any number of target permanent cards with cycling abilities from your graveyard to the battlefield.",
    },
  ],
});
