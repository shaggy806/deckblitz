import { describe, expect, it } from "vitest";

import { A, B, cast, controller, lands, pickFromZone, table, toHand, zone } from "./harness.js";

// "Each player chooses a card in their hand. Then each player reveals their
// chosen card" (Stronghold Gambit): a hidden `look-and-choose` of each hand
// (`destination: "stay"`), then `reveal-hand` `only` the chosen cards, all
// after every choice; then `put-exiled-this-way-onto-battlefield` `revealed`
// reaches the cards still in the hands they were revealed from.
describe("a card chosen from each hand, revealed together (Stronghold Gambit)", () => {
  it("puts every revealed creature card of the lowest mana value onto the battlefield under its owner", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const elf = toHand(game, "Elvish Visionary", B);
    const offeredToA = pickFromZone(a, bears);
    pickFromZone(b, elf);
    cast(game, gambit);
    expect(offeredToA.offered).toContain(bears);
    expect([zone(game, bears), zone(game, elf)]).toEqual(["battlefield", "battlefield"]);
    expect([controller(game, bears), controller(game, elf)]).toEqual([A, B]);
  });

  it("leaves a creature card of greater mana value, and a noncreature card, in hand", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const giant = toHand(game, "Hill Giant");
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(a, giant);
    pickFromZone(b, bears);
    cast(game, gambit);
    expect([zone(game, giant), zone(game, bears)]).toEqual(["hand", "battlefield"]);
  });

  it("a noncreature card chosen does nothing; the lowest is read among creature cards only", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bolt = toHand(game, "Lightning Bolt");
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, bolt);
    pickFromZone(b, giant);
    cast(game, gambit);
    expect([zone(game, bolt), zone(game, giant)]).toEqual(["hand", "battlefield"]);
  });

  it("reveals nothing until every player has chosen", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, bears);
    pickFromZone(b, giant);
    const from = game.state.eventLog.length;
    cast(game, gambit);
    const log = game.state.eventLog.slice(from);
    const chosen = log.flatMap((e, i) => (e.type === "cards-chosen-from-zone" ? [i] : []));
    const revealed = log.flatMap((e, i) => (e.type === "cards-revealed" ? [i] : []));
    expect(chosen.length).toBe(2);
    expect(revealed.length).toBe(2);
    expect(Math.min(...revealed)).toBeGreaterThan(Math.max(...chosen));
    // Only the chosen card of each hand, not the whole hand.
    expect(log.flatMap((e) => (e.type === "cards-revealed" ? e.objects : []))).toEqual([bears, giant]);
  });
});
