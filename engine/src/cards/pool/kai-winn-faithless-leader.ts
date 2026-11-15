import { defineCard } from "../define.js";

// EDHREC rank 31925.

const NAME_TEXT = "As Kai Winn enters, choose a nonland card name.";
const DRAIN_TEXT =
  "Whenever an opponent casts a spell with the chosen name or activates an ability of a source with the chosen name, that player loses 3 life.";

// "A source with the chosen name" is any zone's (a card cycled from a hand,
// an ability activated from a graveyard), mana abilities included: nothing
// says "if it isn't a mana ability".
export default defineCard({
  name: "Kai Winn, Faithless Leader",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bajoran", "Cleric"],
  power: 3,
  toughness: 1,
  text: `${NAME_TEXT}\n${DRAIN_TEXT}`,
  chooseCardNameOnEnter: { filter: { notTypes: ["land"] }, aim: "opponent-spells" },
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { chosenName: true } },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-controller" },
      resolve: null,
      text: DRAIN_TEXT,
    },
    {
      trigger: {
        on: "activates-ability",
        who: "opponent",
        orMana: true,
        source: { chosenName: true },
        sourceAnyZone: true,
      },
      targets: [],
      effect: { kind: "lose-life", amount: 3, who: "trigger-player" },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
