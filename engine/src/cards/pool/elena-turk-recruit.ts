import { defineCard } from "../define.js";

// EDHREC rank 5996.

const HISTORIC = [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] as const;

const ETB_TEXT =
  "When Elena enters, return target non-Assassin historic card from your graveyard to your hand. (Artifacts, legendaries, and Sagas are historic.)";
const CAST_TEXT = "Whenever you cast a historic spell, put a +1/+1 counter on Elena.";

export default defineCard({
  name: "Elena, Turk Recruit",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 4,
  text: `${ETB_TEXT}\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { anyOf: HISTORIC, notSubtypes: ["Assassin"] } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: HISTORIC } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
