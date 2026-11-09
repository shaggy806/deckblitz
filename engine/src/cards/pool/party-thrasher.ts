import { defineCard } from "../define.js";

const CONVOKE_TEXT =
  "Noncreature spells you cast from exile have convoke. (Each creature you tap while casting a noncreature spell from exile pays for {1} or one mana of that creature's color.)";
const MAIN_TEXT =
  "At the beginning of your first main phase, you may discard a card. If you do, exile the top two cards of your library, then choose one of them. You may play that card this turn.";

export default defineCard({
  name: "Party Thrasher",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard", "Wizard"],
  power: 1,
  toughness: 4,
  text: `${CONVOKE_TEXT}\n${MAIN_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { castFrom: ["exile"], filter: { notTypes: ["creature"] }, convoke: true },
      text: CONVOKE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to exile the top two cards of your library?",
        effect: { kind: "discard", target: "you", amount: 1 },
        then: { kind: "impulse-exile", amount: 2, duration: "end-of-turn", play: true, choose: 1 },
      },
      resolve: null,
      text: MAIN_TEXT,
    },
  ],
});
