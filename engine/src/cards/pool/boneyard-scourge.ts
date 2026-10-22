import { defineCard } from "../define.js";

// EDHREC rank 10437. Commander 2017. Nether Traitor's graveyard trigger: it
// works only while this card is in the graveyard, so it doesn't see its own
// death or a Dragon dying beside it (the ruling).

export default defineCard({
  name: "Boneyard Scourge",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Dragon"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever a Dragon you control dies while this card is in your graveyard, you may pay {1}{B}. If you do, return this card from your graveyard to the battlefield.",
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "dies", who: "you-control", filter: { subtype: "Dragon" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B} to return Boneyard Scourge to the battlefield?",
        cost: "{1}{B}",
        effect: { kind: "put-onto-battlefield", target: "source" },
      },
      resolve: null,
      text: "Whenever a Dragon you control dies while this card is in your graveyard, you may pay {1}{B}. If you do, return this card from your graveyard to the battlefield.",
    },
  ],
});
