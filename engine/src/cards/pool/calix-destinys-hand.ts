import { defineCard } from "../define.js";

// Theros Beyond Death. The −3's end is a second target, not Calix (`exile`'s
// `until`): nothing is exiled once that enchantment is gone or illegal (the
// ruling), and it comes back as that enchantment leaves, whatever became of Calix.

const LOOK_TEXT =
  "+1: Look at the top four cards of your library. You may reveal an enchantment card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.";
const EXILE_TEXT = "−3: Exile target creature or enchantment you don't control until target enchantment you control leaves the battlefield.";
const RETURN_TEXT = "−7: Return all enchantment cards from your graveyard to the battlefield.";

export default defineCard({
  name: "Calix, Destiny's Hand",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Calix"],
  loyalty: 4,
  text: `${LOOK_TEXT}\n${EXILE_TEXT}\n${RETURN_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "enchantment" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [
        { kind: "permanent", whose: "opponent", filter: { typesAnyOf: ["creature", "enchantment"] } },
        { kind: "permanent", whose: "you", filter: { type: "enchantment" } },
      ],
      effect: { kind: "exile", target: 0, until: { targetLeaves: 1 } },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "return-from-graveyard", filter: { type: "enchantment" }, destination: "battlefield", count: "all" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
