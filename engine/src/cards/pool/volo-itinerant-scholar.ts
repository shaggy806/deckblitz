import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Volo enters, create Volo's Journal, a legendary colorless Book artifact token with hexproof and \"Whenever you cast a creature spell, note one of its creature types that hasn't been noted for Volo's Journal.\"";
const DRAW_TEXT = "{2}, {T}: Draw a card for each creature type noted for target permanent you control named Volo's Journal.";

export default defineCard({
  name: "Volo, Itinerant Scholar",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${ENTER_TEXT}\n${DRAW_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Volo's Journal Token", count: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", whose: "you", filter: { name: "Volo's Journal" } }],
      effect: { kind: "draw", amount: { notedCreatureTypes: 0 } },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
