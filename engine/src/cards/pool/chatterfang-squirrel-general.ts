import { defineCard } from "../define.js";

// EDHREC rank 1057.
// Makes Squirrel → use "Squirrel Token".
//
// Rulings:
//   [2021-06-18] Chatterfang's second ability applies to all kinds of tokens, including Clue,
//     Food, and Treasure tokens.
//   [2021-06-18] If an effect changes under whose control a token would be created, that effect
//     applies before Chatterfang's effect applies. If an effect changes under whose control a
//     token would enter the battlefield, that effect applies after Chatterfang's effect is able to
//     be applied.
//   [2021-06-18] In a Commander game, the defending player is the player Chatterfang is attacking
//     or the controller of the planeswalker Chatterfang is attacking.
//   [2021-06-18] The additional Squirrel tokens won't have any abilities the other tokens were
//     created with. Anything else specified in the effect creating the token (such as tapped,
//     attacking, "That token gains haste," or "Exile that token at end of combat") applies to both
//     the original tokens and the Squirrels.
//   [2025-01-24] You don't need to control the spell or ability that creates the tokens, nor do
//     you have to be the one creating the tokens for Chatterfang's ability to apply. As long as
//     the tokens are being created under your control, Chatterang's replacement effect will apply.

export default defineCard({
  name: "Chatterfang, Squirrel General",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Squirrel", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["forestwalk"],
  text: "Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\nIf one or more tokens would be created under your control, those tokens plus that many 1/1 green Squirrel creature tokens are created instead.\n{B}, Sacrifice X Squirrels: Target creature gets +X/-X until end of turn.",
  static: [
    {
      // Any kind of token, created under your control by anyone's effect
      // (the rulings); the Squirrels get what the effect does to the tokens,
      // none of what they are.
      affects: { scope: "self" },
      replacement: { event: "would-create-token", plusTokens: "Squirrel Token" },
      text: "If one or more tokens would be created under your control, those tokens plus that many 1/1 green Squirrel creature tokens are created instead.",
    },
  ],
  activated: [
    {
      cost: { mana: "{B}", tap: false, sacrifice: { filter: { subtype: "Squirrel" }, count: "x" } },
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: "x", toughness: { product: ["x", -1] }, duration: "end-of-turn" },
      resolve: null,
      text: "{B}, Sacrifice X Squirrels: Target creature gets +X/-X until end of turn.",
    },
  ],
});
