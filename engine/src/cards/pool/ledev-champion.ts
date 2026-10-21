import type { CardFilter } from "../../filter.js";
import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may tap any number of untapped creatures you control. This creature gets +1/+1 until end of turn for each creature tapped this way.";
const TOKEN_TEXT = "{3}{G}{W}: Create a 1/1 white Soldier creature token with lifelink.";

const UNTAPPED_CREATURE: CardFilter = { type: "creature", controlledBy: "you", tapped: false };

export default defineCard({
  name: "Ledev Champion",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Knight"],
  power: 2,
  toughness: 2,
  text: `${ATTACK_TEXT}\n${TOKEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Soldier Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: UNTAPPED_CREATURE,
            min: 0,
            upTo: { countOf: UNTAPPED_CREATURE },
            then: { kind: "tap", target: 0 },
            prompt: "Tap any number of untapped creatures you control",
          },
          {
            kind: "modify-pt",
            target: "source",
            power: { thisWay: "tapped" },
            toughness: { thisWay: "tapped" },
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
