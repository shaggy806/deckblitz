import { defineCard } from "../define.js";

// "It gains": an effect on a permanent spell, which goes on applying to the
// permanent it becomes (rule 400.7a), with no end.

const MANA_TEXT =
  "{T}: Add two mana in any combination of colors. Spend this mana only to cast Dragon creature spells.";
const GRAVEYARD_TEXT = "Once during each of your turns, you may cast a Dragon creature spell from your graveyard.";
const DIES_TEXT = "When this creature dies, exile it.";
const GAINS_TEXT = `Whenever you cast a Dragon creature spell from your graveyard, it gains "${DIES_TEXT}"`;
const DRAGON = { type: "creature", subtype: "Dragon" } as const;

export default defineCard({
  name: "Rivaz of the Claw",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Warlock"],
  power: 3,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace\n${MANA_TEXT}\n${GRAVEYARD_TEXT}\n${GAINS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castFromGraveyard: { filter: DRAGON, oncePerTurn: true, yourTurnOnly: true },
      text: GRAVEYARD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 2,
        spendOnly: { spell: DRAGON, text: "Spend this mana only to cast Dragon creature spells." },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", from: "graveyard", filter: DRAGON },
      targets: [],
      effect: {
        kind: "grant-triggered",
        target: "trigger-object",
        duration: "permanent",
        ability: {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "exile", target: "trigger-object" },
          resolve: null,
          text: DIES_TEXT,
        },
      },
      resolve: null,
      text: GAINS_TEXT,
    },
  ],
});
