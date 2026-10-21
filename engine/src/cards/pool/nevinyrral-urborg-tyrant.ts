import { defineCard } from "../define.js";

// Hexproof from artifacts, creatures, and enchantments (rule 702.11d): an
// opponent's spell or ability from a source of one of those types can't
// target it. The Zombies are counted as the enters trigger resolves, every
// player's creatures that died this turn. "You may pay {1}. When you do" is
// a reflexive trigger (Anthropede's shape).

const ENTER_TEXT =
  "When Nevinyrral enters, create a tapped 2/2 black Zombie creature token for each creature that died this turn.";
const DIES_TEXT =
  "When Nevinyrral dies, you may pay {1}. When you do, destroy all artifacts, creatures, and enchantments.";

export default defineCard({
  name: "Nevinyrral, Urborg Tyrant",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 3,
  toughness: 6,
  text: `Hexproof from artifacts, creatures, and enchantments\n${ENTER_TEXT}\n${DIES_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { types: ["artifact", "creature", "enchantment"] },
      text: "Hexproof from artifacts, creatures, and enchantments",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Zombie Token",
        count: { creaturesDiedThisTurn: true, anyController: true },
        tapped: true,
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: [],
          effect: { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "creature", "enchantment"] } },
          text: "When you do, destroy all artifacts, creatures, and enchantments.",
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
