import { defineCard } from "../define.js";

const TEXT =
  "When this creature transforms into Lunarch Inquisitors, you may exile another target creature until this creature leaves the battlefield.";

// Constricting Sliver's exile: nothing is exiled if this has left before the
// trigger resolves (rule 610.3a, the ruling), and the creature comes back
// only when this permanent leaves — transforming back doesn't (the ruling).
export default defineCard({
  name: "Lunarch Inquisitors",
  art: "https://cards.scryfall.io/art_crop/back/1/0/1001e708-e4f9-456a-8b9d-3421a2a3833d.jpg",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "may",
        prompt: "Exile the targeted creature until this creature leaves the battlefield?",
        effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Avacynian Missionaries", "Lunarch Inquisitors"],
  transform: true,
});
