import { defineCard } from "../define.js";

const CAST_TEXT =
  "Whenever you cast a historic spell, Jamie McCrimmon gets +X/+X until end of turn, where X is that spell's mana value. (Artifacts, legendaries, and Sagas are historic.)";

export default defineCard({
  name: "Jamie McCrimmon",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["trample"],
  pairing: { kind: "doctors-companion" },
  text: `Trample\n${CAST_TEXT}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
      },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { manaValueOf: "trigger-object" },
        toughness: { manaValueOf: "trigger-object" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
