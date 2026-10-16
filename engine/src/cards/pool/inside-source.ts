import { defineCard } from "../define.js";

const TOKEN_TEXT = "When this creature enters, create a 2/2 white and blue Detective creature token.";
const PUMP_TEXT =
  "{3}, {T}: Target Detective you control gets +2/+0 and gains vigilance until end of turn. Activate only as a sorcery.";

export default defineCard({
  name: "Inside Source",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 1,
  text: `${TOKEN_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Detective Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      // "Target Detective": any permanent with the Detective subtype (a
      // creature, or a kindred card).
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Detective" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      sorcerySpeed: true,
      text: PUMP_TEXT,
    },
  ],
});
