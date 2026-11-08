import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever you attack, if you've activated a loyalty ability this turn, untap target attacking creature. It can't be blocked this turn.";
const GRANTED_TEXT = "−8: Create an 8/8 blue Leviathan creature token with hexproof.";
const GRANT_TEXT = 'Planeswalkers you control have "[−8]: Create an 8/8 blue Leviathan creature token with hexproof."';

export default defineCard({
  name: "Kiora of Salt and Sand",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Noble"],
  power: 2,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      // Any loyalty ability of any permanent, activated by you this turn (the
      // journal's), checked as it triggers and as it resolves (rule 603.4).
      condition: { kind: "turn-history", what: "loyalty-activated", atLeast: 1 },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "unblockable", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [
    {
      // Only one loyalty ability of each planeswalker a turn, however many it
      // has gained (rule 606.3, the ruling).
      affects: { scope: "filter", filter: { type: "planeswalker", controlledBy: "you" } },
      grantsActivated: [
        {
          loyaltyCost: -8,
          cost: { mana: null, tap: false },
          targets: [],
          effect: { kind: "create-token", token: "Leviathan Token (Kiora of Salt and Sand)", count: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
