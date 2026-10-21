import { defineCard } from "../define.js";

// EDHREC rank 8102.
//
// "If you cast it from your hand" is an intervening-if on the source (rule
// 603.4): put onto the battlefield from the hand without being cast, it
// doesn't trigger; a Clone cast from the hand copying it does (the rulings).
// The return is activated from the graveyard (Grafted Butcher's shape): the
// card stays there as the three Foods are sacrificed, and comes back only if
// it's still the same card when the ability resolves (rule 400.7).

const ENTER_TEXT =
  "When this creature enters, if you cast it from your hand, create three Food tokens. (They're artifacts with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const RETURN_TEXT =
  "Sacrifice three Foods: Return this card from your graveyard to the battlefield. Activate only during your turn.";

export default defineCard({
  name: "Feasting Troll King",
  manaCost: "{2}{G}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Noble"],
  power: 7,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: `Vigilance, trample\n${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { cast: true, castBy: "you", castFrom: "hand" } },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Food" }, count: 3 } },
      zone: "graveyard",
      staysInZone: true,
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
