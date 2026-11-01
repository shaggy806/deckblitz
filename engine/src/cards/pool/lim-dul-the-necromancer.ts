import { defineCard } from "../define.js";

const DIES_TEXT =
  "Whenever a creature an opponent controls dies, you may pay {1}{B}. If you do, return that card to the battlefield under your control. If it's a creature, it's a Zombie in addition to its other creature types.";
const REGEN_TEXT = "{1}{B}: Regenerate target Zombie.";

// "If it's a creature" is judged as it enters (`enterAs.ifCreature`): a card
// that comes back as a noncreature (a land that had been animated) isn't a
// Zombie; one that does is a Zombie from the moment it enters, for as long as
// it stays. "That card" is the card in the graveyard (rule 400.7): one that
// has left it isn't returned.
export default defineCard({
  name: "Lim-Dûl the Necromancer",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${DIES_TEXT}\n${REGEN_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{B} to return that card to the battlefield under your control?",
        cost: "{1}{B}",
        effect: {
          kind: "put-onto-battlefield",
          target: "trigger-object",
          underYourControl: true,
          enterAs: { addSubtypes: ["Zombie"], ifCreature: true },
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Zombie" } }],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
});
