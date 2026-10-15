import { defineCard } from "../define.js";

// EDHREC rank 21852.
//
// "Your choice of" is chosen as the alliance trigger resolves (Hungering
// Puppetbeast's shape). The attack trigger is battle cry's wording: the
// other creatures attacking as it resolves (Accorder Paladin's shape).

const ALLIANCE_TEXT =
  "Alliance — Whenever another creature you control enters, Wingnut gains your choice of flying, menace, or haste until end of turn.";
const ATTACK_TEXT = "Whenever Wingnut attacks, each other attacking creature gets +1/+0 until end of turn.";

const gains = (keyword: "flying" | "menace" | "haste", text: string) =>
  ({ text, effect: { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" } }) as const;

export default defineCard({
  name: "Wingnut, Bat on the Belfry",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bat", "Mutant"],
  power: 1,
  toughness: 2,
  text: `${ALLIANCE_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature" },
        otherOnly: true,
      },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [gains("flying", "Flying"), gains("menace", "Menace"), gains("haste", "Haste")],
      },
      resolve: null,
      text: ALLIANCE_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
        exceptSource: true,
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
