import { defineCard } from "../define.js";

const BRAVE_HEART_TEXT =
  "Brave Heart — Whenever you attack, target attacking historic creature gets +1/+1 and gains indestructible until end of turn. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Tegan Jovanka",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 2,
  pairing: { kind: "doctors-companion" },
  text: `${BRAVE_HEART_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [
        {
          kind: "permanent",
          filter: {
            type: "creature",
            attacking: true,
            anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }],
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: BRAVE_HEART_TEXT,
    },
  ],
});
