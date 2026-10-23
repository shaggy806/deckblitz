import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] All other nonland permanents will already be in their owners' hands by the time
//     the Octopus token is created.
//   [2016-01-22] Casting a spell for its surge cost doesn't change its mana cost or its mana value.
//   [2016-01-22] If an instant or sorcery spell cast for its surge cost is copied, the copy is
//     also considered to have had its surge cost paid.

export default defineCard({
  name: "Crush of Tentacles",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  alternativeCost: {
    mana: "{3}{U}{U}",
    keyword: "surge",
    condition: { kind: "cast-this-turn", who: "you", atLeast: 1 },
  },
  text: "Surge {3}{U}{U} (You may cast this spell for its surge cost if you or a teammate has cast another spell this turn.)\nReturn all nonland permanents to their owners' hands. If this spell's surge cost was paid, create an 8/8 blue Octopus creature token.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { notTypes: ["land"] } },
      {
        kind: "conditional",
        condition: { kind: "self-surge-paid" },
        then: { kind: "create-token", token: "Octopus Token", count: 1 },
      },
    ],
  },
});
