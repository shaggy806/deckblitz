import { defineCard } from "../define.js";

// EDHREC rank 8171.
// Makes Food → use "Food Token".
//
// Rulings:
//   [2025-10-02] Food is an artifact type. Even though it appears on some creatures, it's never a
//     creature type.
//   [2025-10-02] If an effect refers to a Food, it means any Food artifact, not just a Food
//     artifact token. For example, you can sacrifice Tough Cookie (an Artifact Creature — Food
//     Golem) to activate Bosco, Just a Bear's ability (an ability with "Sacrifice a Food" in its
//     cost). You can't sacrifice a Food to pay multiple costs. For example, you can't sacrifice a
//     Food token to activate its own ability and also to activate Bosco, Just a Bear's ability.
//   [2025-10-02] Whatever you do, don't eat the delicious cards.
//   [2025-10-02] Some spells and abilities that create Food tokens may require targets. If each
//     target chosen is an illegal target as that spell or ability tries to resolve, it won't
//     resolve. You won't create any Food tokens.

export default defineCard({
  name: "Unlucky Cabbage Merchant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nWhenever you sacrifice a Food, you may search your library for a basic land card and put it onto the battlefield tapped. If you search your library this way, put this creature on the bottom of its owner's library, then shuffle.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Food token.",
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Food" } },
      targets: [],
      // Searching is the "may"; having searched, this creature (if it's
      // still here) goes to the bottom of its owner's library and that
      // library is shuffled — which is shuffling it into that library. The
      // search's own shuffle comes first, which changes nothing.
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "sequence",
          effects: [
            {
              kind: "search-library",
              filter: { supertype: "basic", type: "land" },
              destination: "battlefield",
              min: 0,
              max: 1,
              enterTapped: true,
            },
            { kind: "shuffle-into-library", target: "source" },
          ],
        },
      },
      resolve: null,
      text: "Whenever you sacrifice a Food, you may search your library for a basic land card and put it onto the battlefield tapped. If you search your library this way, put this creature on the bottom of its owner's library, then shuffle.",
    },
  ],
});
