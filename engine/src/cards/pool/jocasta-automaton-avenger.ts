import { defineCard } from "../define.js";

// EDHREC rank 12862. Marvel Super Heroes Commander.
//
// "Your commander" is a commander you own (Archivist of Gondor's and W'Kabi's
// filter). The graveyard return is Warcry Phoenix's shape with Blood
// Operative's intervening if: the trigger works only from the graveyard
// (`fromGraveyard`), and "if this card is in your graveyard" is asked again of
// that same card as it resolves (rule 603.4, `source-zone` `sameObject`).
// Entering attacking, its controller chooses what it attacks (508.4), and it
// was never declared as an attacker, so "whenever ~ attacks" doesn't trigger
// (508.3a).

const COUNTER_TEXT = "Whenever your commander deals combat damage to a player, put a +1/+1 counter on Jocasta.";
const RETURN_TEXT =
  "Whenever you attack with your commander, if this card is in your graveyard, you may return it to the battlefield tapped and attacking.";

export default defineCard({
  name: "Jocasta, Automaton Avenger",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Robot", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${COUNTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { isCommander: true, ownedBy: "you" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      fromGraveyard: true,
      condition: { kind: "source-zone", zones: ["graveyard"], sameObject: true },
      trigger: { on: "attack-with", who: "you", atLeast: 1, filter: { isCommander: true, ownedBy: "you" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Jocasta, Automaton Avenger tapped and attacking?",
        effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
