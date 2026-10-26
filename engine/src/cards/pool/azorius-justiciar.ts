import { defineCard } from "../define.js";

export default defineCard({
  name: "Azorius Justiciar",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "When this creature enters, detain up to two target creatures your opponents control. (Until your next turn, those creatures can't attack or block and their activated abilities can't be activated.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature-an-opponent-controls" }, { kind: "optional", of: { kind: "other", of: "creature-an-opponent-controls", than: { slot: 0 } } }],
      effect: { kind: "sequence", effects: [{ kind: "detain", target: 0 }, { kind: "detain", target: 1 }] },
      resolve: null,
      text: "When this creature enters, detain up to two target creatures your opponents control.",
    },
  ],
});
