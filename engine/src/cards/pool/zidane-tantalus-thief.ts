import { defineCard } from "../define.js";

const ENTERS =
  "When Zidane enters, gain control of target creature an opponent controls until end of turn. Untap it. It gains lifelink and haste until end of turn.";
const TAKEN = "Whenever an opponent gains control of a permanent from you, you create a Treasure token.";

export default defineCard({
  name: "Zidane, Tantalus Thief",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mutant", "Scout"],
  power: 3,
  toughness: 3,
  text: `${ENTERS}\n${TAKEN}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "control-taken" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TAKEN,
    },
  ],
});
