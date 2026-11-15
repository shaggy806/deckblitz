import { defineCard } from "../define.js";

// The back face of Jorn, God of Winter. Zul Ashur's shape — a permission kept
// on the targeted card until end of turn or until it leaves the graveyard
// (rule 400.7) — with `play` (a land too, as the land play: rule 305.1) and
// both halves of "it enters tapped", a replacement on its entry (614.1d):
// `entersTapped` for a permanent spell cast this way, `landsEnterTapped` for a
// land played this way.
//
// Rulings:
//   [2021-02-05] You'll still pay all costs to cast a spell this way, including any additional
//     costs. You may also pay alternative costs if any are available.
//   [2021-02-05] You don't play the card as Kaldring's activated ability is resolving; rather,
//     that ability gives you permission to play that card that turn. You must follow the normal
//     timing permissions and restrictions for the card when you play it. To play a land this way,
//     you must have a land play available.
//   [2021-02-05] If you don't end up playing the card, it remains in your graveyard. You can't
//     play it on future turns unless you target it again with Kaldring's ability.
//   [2021-02-05] A snow permanent card is any artifact, creature, enchantment, land, or
//     planeswalker card with the supertype snow.
//   [2021-02-05] If an effect allows you to play a specific modal double-faced card, you may cast
//     it as a spell or play it as a land, as determined by which face you choose to play.

const PLAY_TEXT =
  "{T}: You may play target snow permanent card from your graveyard this turn. If you do, it enters tapped.";

export default defineCard({
  name: "Kaldring, the Rimestaff",
  art: "https://cards.scryfall.io/art_crop/back/c/6/c697548f-925b-405e-970a-4e78067d5c8e.jpg",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary", "snow"],
  types: ["artifact"],
  text: PLAY_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          // A snow permanent card: any card but an instant or a sorcery (the ruling).
          filter: { supertype: "snow", notTypes: ["instant", "sorcery"] },
        },
      ],
      effect: {
        kind: "grant-play",
        cards: 0,
        duration: "end-of-turn",
        play: true,
        entersTapped: true,
        landsEnterTapped: true,
      },
      resolve: null,
      text: PLAY_TEXT,
    },
  ],
  faces: ["Jorn, God of Winter", "Kaldring, the Rimestaff"],
});
