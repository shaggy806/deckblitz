import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 4320.
// Makes Clue → "Clue Token"; Treasure → "Treasure Token".
//
// One ability with two trigger events. Each vote investigates or makes a
// Treasure on its own, in turn order (rule 101.4).

const VOTE_TEXT =
  "Council's dilemma — Whenever Tivit enters or deals combat damage to a player, starting with you, each player votes for evidence or bribery. For each evidence vote, investigate. For each bribery vote, create a Treasure token.";
const EXTRA_TEXT = "While voting, you may vote an additional time.";
const VOTE = {
  kind: "sequence",
  effects: [
    { kind: "vote", for: { options: ["evidence", "bribery"] } },
    { kind: "for-each-vote", option: 0, effect: { kind: "create-token", token: "Clue Token", count: 1 } },
    { kind: "for-each-vote", option: 1, effect: { kind: "create-token", token: "Treasure Token", count: 1 } },
  ],
} as const;

export default defineCard({
  name: "Tivit, Seller of Secrets",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx", "Rogue"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying, ward {3}\n${VOTE_TEXT}\n${EXTRA_TEXT} (The votes can be for different choices or for the same choice.)`,
  static: [{ affects: { scope: "self" }, votesAdditionalTime: true, text: EXTRA_TEXT }],
  triggered: [
    ward({ mana: "{3}" }),
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: VOTE, resolve: null, text: VOTE_TEXT },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      sameAbilityAs: 1,
      targets: [],
      effect: VOTE,
      resolve: null,
      text: VOTE_TEXT,
    },
  ],
});
