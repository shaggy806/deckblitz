import { defineCard } from "../define.js";

// The slots are the card types among the noncreature spells cast this turn,
// read as it resolves: Hurkyl needn't have been on the battlefield for them
// (the ruling). An artifact creature spell isn't a noncreature spell, and its
// artifact type isn't counted.
const TEXT =
  "At the beginning of your end step, if you've cast a noncreature spell this turn, reveal the top five cards of " +
  "your library. For each card type among noncreature spells you've cast this turn, you may put a card of that type " +
  "from among the revealed cards into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Hurkyl, Master Wizard",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Advisor"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: true,
        min: 0,
        max: 9,
        together: { oneEachTypeAmong: { spellsYouCastThisTurn: { notTypes: ["creature"] } } },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
