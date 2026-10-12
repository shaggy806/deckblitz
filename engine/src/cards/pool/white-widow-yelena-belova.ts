import { defineCard } from "../define.js";

// EDHREC rank 17505. Marvel Super Heroes Commander.
//
// Black Widow, Deadly Hunter's trigger with Sphere Grid's counter: "it" is
// the creature that dealt the damage (the trigger object), deathtouch read as
// it deals the damage.
const COUNTER_TEXT =
  "Whenever a creature you control with deathtouch deals combat damage to a player, put a +1/+1 counter on it.";

export default defineCard({
  name: "White Widow, Yelena Belova",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Assassin", "Villain"],
  power: 1,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "you-control", filter: { type: "creature", keyword: "deathtouch" } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
  ],
});
