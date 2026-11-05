import { defineCard } from "../define.js";

// "A permanent is put into an opponent's graveyard" is a permanent leaving the
// battlefield for its owner's graveyard — a token too (it goes there before it
// ceases to exist), which the card-only `put-into-graveyard` trigger skips. Each
// one triggers on its own, together with this creature or not (the ruling).
const LOSE = "Whenever a permanent is put into an opponent's graveyard, that player loses 1 life.";

export default defineCard({
  name: "Patron of the Nezumi",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 6,
  toughness: 6,
  kicker: { cost: "", keyword: "offering", flash: true, offering: { subtype: "Rat" } },
  text: `Rat offering (You may cast this spell any time you could cast an instant by sacrificing a Rat and paying the difference in mana costs between this and the sacrificed Rat. Mana cost includes color.)\n${LOSE}`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { ownedBy: "opponent" }, to: ["graveyard"] },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-owner" },
      resolve: null,
      text: LOSE,
    },
  ],
});
