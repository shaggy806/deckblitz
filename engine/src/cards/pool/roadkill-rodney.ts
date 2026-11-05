import { defineCard } from "../define.js";

// EDHREC rank 12470.
// Makes Mutagen → use "Mutagen Token".

export default defineCard({
  name: "Roadkill Rodney",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 1,
  keywords: ["deathtouch"],
  kicker: { cost: "{3}", multi: true, keyword: "squad" },
  text: "Squad {3} (As an additional cost to cast this spell, you may pay {3} any number of times. When this creature enters, create that many tokens that are copies of it.)\nDeathtouch\nWhenever this creature deals combat damage to a player, create a Mutagen token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "self-kicked" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1, perTimeKicked: true },
      resolve: null,
      text: "When this creature enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Mutagen Token", count: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, create a Mutagen token.",
    },
  ],
});
