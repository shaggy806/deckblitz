/**
 * `choose-random-card` over a hidden or linked zone: a card at random from a
 * hand — revealed to every player (rule 701.20a — Hired Torturer, Singe-Mind
 * Ogre, Cursed Scroll), or looked at by the effect's controller alone (Urza's
 * Bauble) — or from the cards exiled with the effect's source (rule 607.2a —
 * Skyship Weatherlight, whose search exiles them `linked`). `slot` keeps the
 * ability's own targets beside the picked card.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { viewFor } from "../view.js";

import { A, B, activate, enter, hand, lands, life, pickTargets, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** Discard `player`'s opening hand, so the test's cards are the only ones. */
function emptyHand(game: Game, player: PlayerId): void {
  game.debugApplyEffect(player, { kind: "discard-hand", who: "you" }, []);
  settle(game);
}

/** Answer a pending card-name choice with `name`. */
function nameIt(game: Game, name: string): void {
  game.advanceUntil((s) => s.awaiting !== null);
  expect(game.state.awaiting?.kind).toBe("choose-card-name");
  game.dispatch({ type: "choose-card-name", player: A, name });
  settle(game);
}

describe("a card at random from a hand", () => {
  it("Hired Torturer: target opponent loses 2 life, then reveals a card at random to everyone, which stays in hand", () => {
    const { game } = table();
    emptyHand(game, B);
    const torturer = spawn(game, "Hired Torturer");
    lands(game, "Swamp", 4);
    const cards = [toHand(game, "Grizzly Bears", B), toHand(game, "Shock", B)];
    activate(game, torturer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    const revealed = game.state.revealedThisTurn.filter((id) => cards.includes(id));
    expect(revealed).toHaveLength(1);
    expect(zone(game, revealed[0])).toBe("hand");
    // Alice sees the revealed card, and only that one.
    const seen = Object.keys(viewFor(game.state, game.registry, A).objects);
    expect(cards.filter((id) => seen.includes(id))).toEqual(revealed);
    const picks = game.events.filter((e) => e.type === "chosen-at-random");
    expect(picks).toHaveLength(1);
  });

  it("an empty hand reveals nothing, and the life loss still happens", () => {
    const { game } = table();
    emptyHand(game, B);
    const torturer = spawn(game, "Hired Torturer");
    lands(game, "Swamp", 4);
    activate(game, torturer, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(game.events.filter((e) => e.type === "chosen-at-random")).toHaveLength(0);
  });

  it("Singe-Mind Ogre: the target player loses life equal to the revealed card's mana value, read in hand", () => {
    const { game, a } = table();
    emptyHand(game, B);
    toHand(game, "Serra Angel", B);
    pickTargets(a, B);
    enter(game, "Singe-Mind Ogre");
    expect(life(game, B)).toBe(15);
  });

  it("each card in the hand can be the one picked, the same one for the same seed", () => {
    const pickFor = (seed: number): string => {
      const { game } = table({ seed });
      const torturer = spawn(game, "Hired Torturer");
      lands(game, "Swamp", 4);
      for (const name of ["Grizzly Bears", "Shock", "Opt", "Forest"]) toHand(game, name, B);
      activate(game, torturer, 0, { targets: [ref(B)] });
      const id = game.state.revealedThisTurn[0];
      return game.state.objects[id].cardName;
    };
    const names = new Set<string>();
    for (let seed = 1; seed <= 24; seed += 1) names.add(pickFor(seed));
    expect(names.size).toBe(4);
    expect(pickFor(7)).toBe(pickFor(7));
  });

  it("Cursed Scroll: the named card revealed deals 2 to the target chosen on activation; another name deals none", () => {
    const run = (name: string): number => {
      const { game } = table();
      emptyHand(game, A);
      const scroll = spawn(game, "Cursed Scroll");
      lands(game, "Wastes", 3);
      toHand(game, "Lightning Bolt");
      activate(game, scroll, 0, { targets: [ref(B)], settle: false });
      nameIt(game, name);
      return life(game, B);
    };
    expect(run("Lightning Bolt")).toBe(18);
    expect(run("Shock")).toBe(20);
  });

  it("Magus of the Scroll reads the same: one card in hand with the name, the target takes 2", () => {
    const { game } = table();
    emptyHand(game, A);
    const magus = spawn(game, "Magus of the Scroll");
    lands(game, "Wastes", 3);
    const bear = spawn(game, "Grizzly Bears", B);
    toHand(game, "Opt");
    activate(game, magus, 0, { targets: [ref(bear)], settle: false });
    nameIt(game, "Opt");
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("Urza's Bauble: the controller alone looks at the one card, which nobody else sees; the draw waits for the next upkeep", () => {
    const { game } = table();
    emptyHand(game, B);
    const bauble = spawn(game, "Urza's Bauble");
    const cards = [toHand(game, "Grizzly Bears", B), toHand(game, "Shock", B)];
    toLibrary(game, "Opt");
    const before = hand(game, A).length;
    activate(game, bauble, 0, { targets: [ref(B)], settle: false });
    game.advanceUntil((s) => s.awaiting !== null);
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-from-zone");
    if (awaiting?.kind !== "choose-from-zone") return;
    expect(awaiting.player).toBe(A);
    expect(awaiting.ids).toHaveLength(1);
    const looked = awaiting.ids[0];
    expect(cards).toContain(looked);
    expect(Object.keys(viewFor(game.state, game.registry, A).objects)).toContain(looked);
    // Not revealed: a third party's view never gets it, and nothing is
    // recorded as shown to everyone.
    expect(game.state.revealedThisTurn).not.toContain(looked);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [] });
    settle(game);
    expect(zone(game, bauble)).toBe("graveyard");
    expect(hand(game, A).length).toBe(before);
    expect(cards.every((id: ObjectId) => zone(game, id) === "hand")).toBe(true);
  });
});

describe("a card at random from those exiled with the source", () => {
  it("Skyship Weatherlight: the finds are exiled with it, and one of them comes back to hand at random", () => {
    const { game, a } = table();
    const finds = [toLibrary(game, "Grizzly Bears"), toLibrary(game, "Mind Stone")];
    toLibrary(game, "Shock");
    a.chooseFromZoneFn = (_view, eligible) => [...eligible];
    const skyship = enter(game, "Skyship Weatherlight");
    expect(finds.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(finds.every((id) => game.state.objects[id].exiledWith?.source === skyship)).toBe(true);
    lands(game, "Wastes", 4);
    activate(game, skyship, 0);
    expect(finds.filter((id) => zone(game, id) === "hand")).toHaveLength(1);
    // The other is still exiled with it; a card exiled by something else is
    // never picked.
    const stranger = game.debugSpawn("Lightning Bolt", A, "exile");
    game.state.objects[skyship].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, skyship, 0);
    expect(finds.every((id) => zone(game, id) === "hand")).toBe(true);
    expect(zone(game, stranger)).toBe("exile");
    game.state.objects[skyship].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, skyship, 0);
    expect(zone(game, stranger)).toBe("exile");
  });
});
