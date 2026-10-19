import { defineCard } from "../define.js";

// EDHREC rank 11333.
//
// Rulings:
//   You can use the {C} added by a Powerstone token on anything that isn't a nonartifact spell.
//   Entering tapped isn't part of a Powerstone token's definition: the token is created tapped.

const ATTACK_TEXT =
  "Whenever Ashnod attacks, you may sacrifice another creature. If you do, create a tapped Powerstone token.";
const ZOMBIE_TEXT =
  "{5}, Exile a creature card from your graveyard: Create a tapped 3/3 colorless Zombie artifact creature token.";

export default defineCard({
  name: "Ashnod, Flesh Mechanist",
  manaCost: "{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK_TEXT}\n${ZOMBIE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { type: "creature" }, exceptSource: true, text: "Sacrifice another creature" }],
        ifDid: { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: false, exileFromGraveyard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Token (Ashnod, Flesh Mechanist)", count: 1, tapped: true },
      resolve: null,
      text: ZOMBIE_TEXT,
    },
  ],
});
