import { defineCard } from "../define.js";

const ETB_TEXT =
  "When this creature enters, counter up to one target activated or triggered ability. If an ability of an artifact, creature, or planeswalker is countered this way, that permanent loses all abilities for as long as this creature remains on the battlefield. (Mana abilities can't be targeted.)";

export default defineCard({
  name: "Tishana's Tidebinder",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 3,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "activated-or-triggered-ability" }],
      effect: {
        kind: "counter",
        target: 0,
        thenSource: {
          filter: { typesAnyOf: ["artifact", "creature", "planeswalker"] },
          effect: { kind: "lose-abilities", target: 0, duration: "while-source" },
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
