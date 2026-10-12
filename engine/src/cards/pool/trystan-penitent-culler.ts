import { defineCard } from "../define.js";

/** The back face of Trystan, Callous Cultivator. "You may exile an Elf card
 * from your graveyard. If you do" is Emeritus of Ideation's shape: a choice of
 * none or one, and the life loss only if one was exiled. */
const CULL_TEXT =
  "Whenever this creature transforms into Trystan, Penitent Culler, mill three cards, then you may exile an Elf card from your graveyard. If you do, each opponent loses 2 life.";
const TRANSFORM_TEXT = "At the beginning of your first main phase, you may pay {G}. If you do, transform Trystan.";

export default defineCard({
  name: "Trystan, Penitent Culler",
  art: "https://cards.scryfall.io/art_crop/back/2/0/2094f9b6-ce84-47d9-8819-81db14ba483f.jpg",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Warlock"],
  power: 3,
  toughness: 4,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${CULL_TEXT}\n${TRANSFORM_TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 3 },
          {
            kind: "look-and-choose",
            zone: "graveyard",
            filter: { subtype: "Elf" },
            min: 0,
            max: 1,
            destination: "exile",
            leftover: "stay",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: { kind: "lose-life", amount: 2, who: "each-opponent" },
          },
        ],
      },
      resolve: null,
      text: CULL_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "precombat-main", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} to transform Trystan?",
        cost: "{G}",
        effect: { kind: "transform", target: "source" },
      },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Trystan, Callous Cultivator", "Trystan, Penitent Culler"],
  transform: true,
});
