import { defineCard } from "../define.js";

// The back face of Valentin, Dean of the Vein // Lisette, Dean of the Root.
const GAIN =
  "Whenever you gain life, you may pay {1}. If you do, put a +1/+1 counter on each creature you control and those creatures gain trample until end of turn.";

export default defineCard({
  name: "Lisette, Dean of the Root",
  art: "https://cards.scryfall.io/art_crop/back/6/5/65008352-bc7e-40b2-a832-b46813e5dc4c.jpg",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 4,
  toughness: 4,
  text: GAIN,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to put a +1/+1 counter on each creature you control?",
        cost: "{1}",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
            { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "trample", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: GAIN,
    },
  ],
  faces: ["Valentin, Dean of the Vein", "Lisette, Dean of the Root"],
});
