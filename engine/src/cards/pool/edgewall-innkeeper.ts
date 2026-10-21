import { defineCard } from "../define.js";

// EDHREC rank 12716. "A creature spell that has an Adventure" (rule 715.2a):
// `hasAdventure` never matches a spell cast as the Adventure (an instant or
// sorcery then — the ruling), and the `creature` type keeps it so too.

const TEXT = "Whenever you cast a creature spell that has an Adventure, draw a card.";

export default defineCard({
  name: "Edgewall Innkeeper",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Peasant"],
  power: 1,
  toughness: 1,
  text: `${TEXT} (It doesn't need to have gone on the adventure first.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", hasAdventure: true } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
