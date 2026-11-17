import { defineCard } from "../define.js";
import { craft } from "../helpers.js";

// EDHREC rank 12785.
//
// Rulings:
//   [2023-11-10] Once Braided Quipu is back in your library, Braided Net will be the face that's
//     up again.
//   [2023-11-10] If a card that isn't a transforming double-faced card becomes a copy of a card
//     with craft, it'll stay in exile if you activate the craft ability. It won't return to the
//     battlefield.
//   [2023-11-10] No activated abilities of the target nonland permanent can be activated for as
//     long as it remains tapped, even if those activated abilities' costs involve untapping that
//     permanent.
//   [2023-11-10] If the materials required include multiple objects, you may exile some of them
//     from among permanents you control and the rest from among cards in your graveyard. You don't
//     have to choose all permanents or all cards from your graveyard.
//   [2023-11-10] The back faces of some cards with craft refer to cards "used to craft" it. This
//     refers to the cards exiled as part of the cost of the craft ability of the front face. Those
//     cards are considered to be "used to craft" that permanent as long as they remain exiled and
//     the permanent remains on the battlefield, even if the permanent's controller changes or some
//     of its characteristics change (because of a copy effect, for example.)
//   [2023-11-10] You may exile tokens you control as part of the materials required. However,
//     because they aren't cards and won't stay in exile, any abilities that refer to what you
//     "used to craft" the back faces won't refer to anything.
//   [2023-11-10] Braided Net's activated ability can target another nonland permanent that's
//     already tapped.
//   [2023-11-10] After drawing cards for Braided Quipu's ability, if you have two or fewer cards
//     in your library, you'll put Braided Quipu on the bottom of your library.
//
// Koma's "tap it, its activated abilities can't be activated", for as long as it remains tapped:
// a `prohibit` lasting `{ whileTapped: 0 }`, ended as that permanent untaps or leaves (rule
// 611.2b). Mana abilities are activated abilities too.

const NET = "{T}, Remove a net counter from this artifact: Tap another target nonland permanent. Its activated abilities can't be activated for as long as it remains tapped.";

export default defineCard({
  name: "Braided Net",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: `This artifact enters with three net counters on it.\n${NET}\nCraft with artifact {1}{U} ({1}{U}, Exile this artifact, Exile another artifact you control or an artifact card from your graveyard: Return this card transformed under its owner's control. Craft only as a sorcery.)`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "net", amount: 3 } },
      text: "This artifact enters with three net counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "net", count: 1 } },
      targets: [{ kind: "other", of: "nonland-permanent" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          {
            kind: "prohibit",
            prohibits: [{ act: "activate", who: "each-player", target: 0 }],
            duration: { whileTapped: 0 },
          },
        ],
      },
      resolve: null,
      text: NET,
    },
    craft("{1}{U}", { count: 1, filter: { type: "artifact" }, text: "artifact" }, "Craft with artifact {1}{U}"),
  ],
  faces: ["Braided Net", "Braided Quipu"],
  transform: true,
});
