import { defineCard } from "../define.js";

// EDHREC rank 11154.
//
// Rulings:
//   - If an artifact or Human card is put into your graveyard during your
//     main phase and the stack is empty, you have a chance to cast it before
//     any player may attempt to remove that card from your graveyard.
//   - Once you begin to cast the spell, losing control of Arcade Gannon won't
//     affect the spell.
//   - You must follow the normal timing permissions and restrictions of the
//     spell you cast from your graveyard.
//   - If you cast one artifact or Human spell from your graveyard and then
//     have a new Arcade Gannon come under your control in the same turn, you
//     may cast another artifact or Human spell from your graveyard that turn
//     as long as that spell has mana value less than or equal to the number of
//     quest counters on the new Arcade Gannon.
//   - You must pay the costs to cast that spell. If it has an alternative
//     cost, you may cast it for that cost instead.
//   - If you cast an artifact or Human spell from your graveyard using another
//     permission, Arcade Gannon's effect doesn't apply. You can cast another
//     artifact or Human spell from your graveyard.
//
// "For Auld Lang Syne" is an ability word (rule 207.2c): no rules meaning.
// The permission is Karador's (once per source object, your turns only) with
// a mana value read against the quest counters on Arcade Gannon live, as the
// spell is offered (`PlayTerms.filter`'s `{ amount }` from its source).
const PERMISSION_TEXT =
  "For Auld Lang Syne — Once during each of your turns, you may cast an artifact or Human spell from your graveyard with mana value less than or equal to the number of quest counters on Arcade Gannon.";
const LOOT_TEXT = "{T}: Draw a card, then discard a card. Put a quest counter on Arcade Gannon.";

export default defineCard({
  name: "Arcade Gannon",
  art: "https://scryfall.com/card/pip/92",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 2,
  toughness: 3,
  text: `${LOOT_TEXT}\n${PERMISSION_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "discard", target: "you", amount: 1 },
          { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
        ],
      },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      mayPlay: {
        from: "graveyard",
        filter: {
          anyOf: [{ type: "artifact" }, { subtype: "Human" }],
          manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "quest" } } },
        },
        oncePerTurn: true,
        yourTurnOnly: true,
      },
      text: PERMISSION_TEXT,
    },
  ],
});
