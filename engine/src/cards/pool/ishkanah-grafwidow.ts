import { defineCard } from "../define.js";

// EDHREC rank 6776.
//
// Rulings:
//   [2016-07-13] The number of Spiders you control is checked only as Ishkanah's last ability
//     resolves. The ability will count Ishkanah itself if it's still on the battlefield.
//
// Delirium is an intervening "if" (rule 603.4 — Demolisher Spawn's shape):
// checked as the trigger would fire and again as it resolves.
const DELIRIUM_TEXT =
  "Delirium — When Ishkanah enters, if there are four or more card types among cards in your graveyard, " +
  "create three 1/2 green Spider creature tokens with reach.";
const DRAIN_TEXT = "{6}{B}: Target opponent loses 1 life for each Spider you control.";

export default defineCard({
  name: "Ishkanah, Grafwidow",
  manaCost: "{4}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 3,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${DELIRIUM_TEXT}\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "delirium" },
      targets: [],
      effect: { kind: "create-token", token: "1/2 Green Spider Token (Reach)", count: 3 },
      resolve: null,
      text: DELIRIUM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{6}{B}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "lose-life",
        target: 0,
        amount: { countOf: { subtype: "Spider", controlledBy: "you" } },
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
