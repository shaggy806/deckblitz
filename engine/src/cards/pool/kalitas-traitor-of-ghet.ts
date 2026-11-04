import { defineCard } from "../define.js";

// Makes Zombie → uses "Zombie Token".
//
// Rulings:
//   Abilities that trigger whenever a creature an opponent controls dies won't trigger unless that
//   creature is a token, which goes to its owner's graveyard as normal.
//   You can't sacrifice Kalitas to activate the last ability, even if it has become a Zombie.
//   If Kalitas dies at the same time as creatures your opponents control, those creature cards will
//   be exiled and you'll get that many Zombies.
//
// No "when you do": the Zombie is part of the replacement (rule 614.1a), so
// there's nothing on the stack to respond to.
const REPLACE_TEXT =
  "If a nontoken creature an opponent controls would die, instead exile that card and create a 2/2 black Zombie creature token.";
const PUMP_TEXT = "{2}{B}, Sacrifice another Vampire or Zombie: Put two +1/+1 counters on Kalitas.";

export default defineCard({
  name: "Kalitas, Traitor of Ghet",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Vampire", "Warrior"],
  power: 3,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${REPLACE_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-be-put-into-graveyard",
        instead: "exile",
        from: "battlefield",
        filter: { type: "creature", controlledBy: "opponent", token: false },
        then: { kind: "create-token", token: "Zombie Token", count: 1 },
      },
      text: REPLACE_TEXT,
    },
  ],
  activated: [
    {
      cost: {
        mana: "{2}{B}",
        tap: false,
        sacrifice: { filter: { anyOf: [{ subtype: "Vampire" }, { subtype: "Zombie" }], isSource: false } },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
