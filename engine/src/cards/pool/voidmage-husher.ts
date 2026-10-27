import { defineCard } from "../define.js";

// Time Spiral. EDHREC rank 19777.
//
// Azorius Guildmage's counter-an-activated-ability target on an enters
// trigger, and Haru-Onna's "you may return this creature" cast trigger.

const ETB_TEXT = "When this creature enters, counter target activated ability. (Mana abilities can't be targeted.)";
const CAST_TEXT = "Whenever you cast a spell, you may return this creature to its owner's hand.";

export default defineCard({
  name: "Voidmage Husher",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "ability", abilityKind: "activated" }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Voidmage Husher to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
