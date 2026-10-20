import { defineCard } from "../define.js";

// "Put into your graveyard" is about the graveyard, not who controlled it
// (the first ruling): a card always goes to its owner's graveyard, so both
// triggers ask who owns the creature that died (Viridian Revel's shape). A
// token's owner is the player who created it (the third ruling).
const ZOMBIE_TEXT =
  "Whenever a nontoken creature is put into your graveyard from the battlefield, create a 2/2 black Zombie creature token.";
const EXILE_TEXT =
  "When a creature is put into an opponent's graveyard from the battlefield, exile this creature.";

export default defineCard({
  name: "Magus of the Bridge",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 4,
  toughness: 4,
  text: `${ZOMBIE_TEXT}\n${EXILE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: { kind: "exile", target: "source" },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
