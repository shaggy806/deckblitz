import { defineCard } from "../define.js";

// EDHREC rank 12910.
//
// The combat trigger is an intervening if (rule 603.4): checked as each
// combat begins and again on resolution (the ruling). Tuvasa the Sunlit's
// first-enchantment-spell trigger.

const CAST_TEXT =
  "Whenever you cast your first enchantment spell each turn, create a 2/2 white Nymph enchantment creature token.";
const COMBAT_TEXT =
  "At the beginning of each combat, if you control five or more enchantments, Psemilla gets +4/+4 and gains lifelink until end of turn.";

export default defineCard({
  name: "Psemilla, Meletian Poet",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Bard"],
  power: 1,
  toughness: 1,
  text: `${CAST_TEXT}\n${COMBAT_TEXT} (Damage dealt by this creature also causes you to gain that much life.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true, filter: { type: "enchantment" } },
      targets: [],
      effect: { kind: "create-token", token: "Nymph Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "any" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 5 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 4, toughness: 4, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
