import { defineCard } from "../define.js";

// Both abilities work only from the graveyard (fromGraveyard), and their
// "if this card is in your graveyard" is an intervening-if checked again as
// each resolves (the ruling) — Blood Operative's shape. "Put into your
// graveyard" is the dead card's owner, not its controller (the ruling).
const IN_GRAVEYARD = { kind: "source-zone", zones: ["graveyard"], sameObject: true } as const;

export default defineCard({
  name: "Bridge from Below",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Whenever a nontoken creature is put into your graveyard from the battlefield, if this card is in your graveyard, create a 2/2 black Zombie creature token.\nWhen a creature is put into an opponent's graveyard from the battlefield, if this card is in your graveyard, exile this card.",
  triggered: [
    {
      fromGraveyard: true,
      condition: IN_GRAVEYARD,
      trigger: { on: "dies", who: "any", filter: { type: "creature", token: false, ownedBy: "you" } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token", count: 1 },
      resolve: null,
      text: "Whenever a nontoken creature is put into your graveyard from the battlefield, if this card is in your graveyard, create a 2/2 black Zombie creature token.",
    },
    {
      fromGraveyard: true,
      condition: IN_GRAVEYARD,
      trigger: { on: "dies", who: "any", filter: { type: "creature", ownedBy: "opponent" } },
      targets: [],
      effect: { kind: "exile", target: "source" },
      resolve: null,
      text: "When a creature is put into an opponent's graveyard from the battlefield, if this card is in your graveyard, exile this card.",
    },
  ],
});
