import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a spell with mana value 4 or greater, you may exile the top card of your library. If you do, you may play that card until you exile another card with this creature.";

export default defineCard({
  name: "Superior Foes of Spider-Man",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { manaValue: { op: "gte", n: 4 } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile the top card of your library? You may play it until you exile another card with this creature.",
        effect: { kind: "impulse-exile", amount: 1, duration: "until-next-exile" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
