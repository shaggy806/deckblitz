import { defineCard } from "../define.js";

// Flagged "Build ASAP". The Ur-Dragon's Eminence and batched attack trigger;
// the casts are made while the trigger resolves (the ruling), one card at a
// time in the order the player picks, at most one a player — `cast-now`'s
// `repeat` with `onePerGraveyard`, read by each milled card's owner, who is
// the player who milled it. Free, so no alternative cost and X is 0 (rules
// 118.9a, 107.3b); a land card is never cast.

const EMINENCE_TEXT =
  "Eminence — As long as The Ur-Sphinx is in the command zone or on the battlefield, other Sphinx spells you cast cost {1} less to cast.";
const ATTACK_TEXT =
  "Whenever one or more Sphinxes you control attack, each player mills that many cards. For each player, you may cast a card that player milled this way without paying its mana cost.";

export default defineCard({
  name: "The Ur-Sphinx",
  manaCost: "{6}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx", "Avatar"],
  power: 10,
  toughness: 10,
  keywords: ["flying"],
  text: `${EMINENCE_TEXT}\nFlying\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      fromCommandZone: true,
      costModification: {
        applies: { subtype: "Sphinx", controlledBy: "you" },
        reduceGeneric: 1,
        otherOnly: true,
      },
      text: EMINENCE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks-batch", who: "you", filter: { subtype: "Sphinx", controlledBy: "you" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-player", amount: { triggerValue: true } },
          { kind: "cast-now", from: "milled-this-way", free: true, repeat: true, onePerGraveyard: true },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
