import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Frontier Siege's shape: the word chosen
// as it enters gates each mode's trigger. Cosplay's "that spell" is the
// trigger object, its mana value read as the trigger resolves (the spell on
// the stack, or as it last existed there).

const CHOOSE_TEXT = "As this creature enters the battlefield, choose cosplay or science.";
const COSPLAY_TEXT =
  "• Cosplay — Whenever you cast a creature or planeswalker spell, this creature's base power and toughness each become equal to that spell's mana value until end of turn.";
const SCIENCE_TEXT =
  "• Science — Whenever you cast an instant or sorcery spell, this creature deals 2 damage to each opponent.";

export default defineCard({
  name: "The Marvelous Scientist",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${CHOOSE_TEXT}\n${COSPLAY_TEXT}\n${SCIENCE_TEXT}`,
  chooseOnEnter: ["Cosplay", "Science"],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } },
      condition: { kind: "chosen-on-enter", value: "Cosplay" },
      targets: [],
      effect: {
        kind: "become",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: { manaValueOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: COSPLAY_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { typesAnyOf: ["instant", "sorcery"] } },
      condition: { kind: "chosen-on-enter", value: "Science" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: SCIENCE_TEXT,
    },
  ],
});
