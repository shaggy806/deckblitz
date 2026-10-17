import { defineCard } from "../define.js";

const HISTORIC = { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] } as const;
const CAST_TEXT =
  "Whenever you cast a historic spell, create a 1/1 white Soldier creature token. (Artifacts, legendaries, and Sagas are historic.)";
// The {8} is paid (or not) as the ability resolves (the ruling), and X is
// counted once, as it resolves (rule 608.2h).
const ATTACK_TEXT =
  "Whenever Alistair attacks, you may pay {8}. If you do, creatures you control get +X/+X until end of turn, where X is the number of historic permanents you control.";

export default defineCard({
  name: "Alistair, the Brigadier",
  manaCost: "{1}{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  text: `${CAST_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: HISTORIC },
      targets: [],
      effect: { kind: "create-token", token: "Soldier Token", count: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {8} to give creatures you control +X/+X?",
        cost: "{8}",
        effect: {
          kind: "modify-pt-all",
          filter: { type: "creature", controlledBy: "you" },
          power: { countOf: { ...HISTORIC, controlledBy: "you" } },
          toughness: { countOf: { ...HISTORIC, controlledBy: "you" } },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
