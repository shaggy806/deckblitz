import { defineCard } from "../define.js";

// SOC #37. EDHREC rank 12506.
//
// Rulings:
//   When Spirit of Resilience becomes a copy of the chosen card, it's neither
//     entering nor leaving the battlefield. Any enters abilities or
//     leaves-the-battlefield abilities won't trigger.
//   If multiple cards leave your graveyard at the same time, Spirit of
//     Resilience's ability will trigger only once.
//   If the copied card has {X} in its mana cost, X is 0.
//   Spirit of Resilience copies exactly what was printed on the original card
//     and nothing else. It doesn't copy any information about the object the
//     card was before it was put into your graveyard.
const TEXT =
  "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature, then you may have this creature become a copy of an artifact or creature card from among those cards until end of turn.";

/**
 * Spirit of Resilience. "Those cards" are found where they went only in a
 * public zone, and only while each is still the object it became there (rule
 * 400.7e): one returned to a hand or shuffled into a library can't be chosen,
 * nor one exiled face down (rule 406.3a). Each is an artifact or creature
 * card as it was in the graveyard, and the copy is of the card as printed
 * (`ofCard` — the ruling), an {X} in its cost as 0 on the battlefield (rule
 * 107.3g), changing nothing about the counters on it. The choice is the
 * `look-and-choose` over the trigger's batch, none chosen being "you may"
 * declined.
 */
export default defineCard({
  name: "Spirit of Resilience",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          {
            kind: "look-and-choose",
            zone: "trigger-batch",
            filter: { typesAnyOf: ["artifact", "creature"] },
            min: 0,
            max: 1,
            destination: "stay",
            leftover: "stay",
            prompt:
              "You may choose an artifact or creature card from among those cards: this creature becomes a copy of it until end of turn",
            then: { kind: "become-copy", target: "source", of: 0, ofCard: true, until: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
