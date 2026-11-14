import { defineCard } from "../define.js";

// "The creature put onto the battlefield with Havengul Mystery" is linked to the
// transform trigger that put it there (rule 607.2c): `putThereBySource: {
// triggered: 0 }`, the creature's entry made by that ability of this permanent in
// this stint of it (rule 400.7) — not a Clue Havengul Laboratory made, and not a
// creature this land returned before it left and came back.

const RETURN_TEXT =
  "When this land transforms into Havengul Mystery, return target creature card from your graveyard to the battlefield.";
const LEAVES_TEXT =
  "When the creature put onto the battlefield with Havengul Mystery leaves the battlefield, transform Havengul Mystery.";

export default defineCard({
  name: "Havengul Mystery",
  art: "https://cards.scryfall.io/art_crop/back/8/2/823b019e-10c0-4712-8167-d4f37a71e782.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `${RETURN_TEXT}\n${LEAVES_TEXT}\n{T}, Pay 1 life: Add {B}.`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "any", filter: { putThereBySource: { triggered: 0 } } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payLife: 1 },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}, Pay 1 life: Add {B}.",
    },
  ],
  faces: ["Havengul Laboratory", "Havengul Mystery"],
  transform: true,
});
