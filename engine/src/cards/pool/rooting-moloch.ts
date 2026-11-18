import { defineCard } from "../define.js";

// EDHREC rank 17459.
//
// Rulings:
//   [2020-04-17] You must follow the normal timing permissions and restrictions for the exiled
//     card. If it's a land, you can't play it unless you have land plays available.
//   [2020-04-17] You'll still pay all costs for a spell cast this way, including additional
//     costs. You may also pay alternative costs if any are available.
//   [2020-04-17] Rooting Moloch gives you permission to play the card as a land or cast it as a
//     spell. You can't cycle the exiled card.
//   [2020-04-17] If you don't play the exiled card, it remains exiled.
//
// Practiced Scrollsmith's shape with `play: true` (a land too, with a land play
// left — rules 305.2a, 305.3); "a card with a cycling ability" is any cycling,
// typecycling included (rule 702.29e).
const ENTER_TEXT =
  "When this creature enters, exile target card with a cycling ability from your graveyard. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Rooting Moloch",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\nCycling {2} ({2}, Discard this card: Draw a card.)`,
  cycling: { cost: "{2}" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { hasKeyword: "cycling" } }],
      effect: { kind: "exile", target: 0, mayPlay: { duration: "until-end-of-your-next-turn", play: true } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
