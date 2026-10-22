import { defineCard } from "../define.js";

// EDHREC rank 14496.
//
// `activates-ability`'s `source` reads the ability's source on the battlefield
// as it's activated, so a card's ability in a hand or graveyard doesn't count
// (ruling); a mana ability never triggers it.
//
// Rulings:
//   [2017-02-09] An ability whose cost is simply {0} can be activated as many times as you'd like.
//     Each activation causes Crackdown Construct's ability to trigger.
//   [2017-02-09] Crackdown Construct's ability doesn't trigger if you activate an ability of an
//     artifact or creature card not on the battlefield.
//   [2017-02-09] Activated abilities are written in the form "Cost: Effect." Some keyword
//     abilities, such as equip and crew, are activated abilities.

const TEXT =
  "Whenever you activate an ability of an artifact or creature that isn't a mana ability, this creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Crackdown Construct",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "activates-ability", who: "you", source: { typesAnyOf: ["artifact", "creature"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
