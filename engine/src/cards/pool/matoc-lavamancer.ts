import { defineCard } from "../define.js";

// Mystery Booster Commander Edition. "Whenever a source you control deals
// damage, if at least one permanent or player was dealt exactly 2 of that
// damage" is the once-per-event `deals-damage` (no recipient named, rule
// 603.2c) with `anyRecipientExactly: 2`: 2 to each of three opponents at once
// triggers it once, and 3 to one and 1 to another not at all.
const TRIGGER_TEXT =
  "Whenever a source you control deals damage, if at least one permanent or player was dealt exactly 2 of that damage, exile the top card of your library. You may play it until the end of your next turn.";
const PING_TEXT = "{R}, {T}, Exile two cards from your graveyard: Matoc deals 2 damage to any other target.";

export default defineCard({
  name: "Matoc, Lavamancer",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${TRIGGER_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", anyRecipientExactly: 2 },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "until-end-of-your-next-turn", play: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: true, exileFromGraveyard: { count: 2 } },
      targets: [{ kind: "other", of: "any-target" }],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
