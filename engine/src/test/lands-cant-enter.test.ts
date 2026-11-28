/**
 * "Lands can't enter the battlefield" (Worms of the Earth): an `enter`
 * prohibition read as the permanent would enter (`asEntering`, rule 614.12).
 * A land put there by an effect stays where it is, a Clone entering as a copy
 * of a land is put into its owner's graveyard instead (the card's ruling), and
 * a land token isn't created (rule 111.5). "Creature cards in graveyards
 * can't enter" (Kunoros) still reads the card where it is.
 */

import { describe, expect, it } from "vitest";

import { A, B, cast, graveyard, lands, life, pickFromZone, pickModes, ref, spawn, table, toGraveyard, toHand, toStep, tokensNamed, zone } from "./harness.js";

const playable = (game: ReturnType<typeof table>["game"], card: string): boolean =>
  game.legalActions(A).some((a) => a.kind === "play-land" && a.card === card);

describe("Worms of the Earth: lands can't enter the battlefield", () => {
  it("players can't play lands", () => {
    const { game } = table();
    const forest = toHand(game, "Forest");
    expect(playable(game, forest)).toBe(true);
    spawn(game, "Worms of the Earth", B);
    expect(playable(game, forest)).toBe(false);
  });

  it("a land put onto the battlefield by an effect stays where it is", () => {
    const { game } = table();
    spawn(game, "Worms of the Earth", B);
    const forest = toHand(game, "Forest");
    expect(game.debugMove(forest, "battlefield")).toBe(false);
    expect(zone(game, forest)).toBe("hand");
    // A nonland still enters.
    const bears = toHand(game, "Grizzly Bears");
    expect(game.debugMove(bears, "battlefield")).toBe(true);
  });

  it("a Clone entering as a copy of a land is put into its owner's graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const arbor = spawn(game, "Dryad Arbor", B);
    spawn(game, "Worms of the Earth", B);
    pickFromZone(a, arbor);
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(zone(game, clone)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(clone);
  });

  it("a Clone copying a nonland creature enters", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Worms of the Earth", B);
    pickFromZone(a, bears);
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(zone(game, clone)).toBe("battlefield");
  });

  it("a token copy of a land isn't created (rule 111.5)", () => {
    const { game } = table();
    const forest = lands(game, "Forest", 1)[0];
    spawn(game, "Worms of the Earth", B);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 2 }, [ref(forest)]);
    // Enough to be made as one stack, were they made.
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 30 }, [ref(forest)]);
    toStep(game, "postcombat-main");
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Forest")).toEqual([forest]);
  });

  it("(without it, the token copies of a land are created)", () => {
    const { game } = table();
    const forest = lands(game, "Forest", 1)[0];
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 2 }, [ref(forest)]);
    expect(tokensNamed(game, "Forest")).toBe(2);
  });

  it("other tokens are created", () => {
    const { game } = table();
    spawn(game, "Worms of the Earth", B);
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 }, []);
    expect(tokensNamed(game, "Soldier Token")).toBe(2);
  });

  it("Kunoros's card-where-it-is reading is unchanged", () => {
    const { game } = table();
    spawn(game, "Kunoros, Hound of Athreos", B);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(game.debugMove(bears, "battlefield")).toBe(false);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Worms of the Earth: the upkeep trigger", () => {
  it("nobody does either: it stays", () => {
    const { game, a, b } = table();
    const worms = spawn(game, "Worms of the Earth", A);
    pickModes(a);
    pickModes(b);
    toStep(game, "draw", B);
    expect(zone(game, worms)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("a player takes 5 damage: it's destroyed", () => {
    const { game, a, b } = table();
    const worms = spawn(game, "Worms of the Earth", A);
    pickModes(a);
    // Bob has no lands: the damage is all he's offered.
    pickModes(b, 0);
    toStep(game, "draw", B);
    expect(life(game, B)).toBe(15);
    expect(zone(game, worms)).toBe("graveyard");
  });

  it("a player sacrifices two lands: it's destroyed", () => {
    const { game, a, b } = table();
    // Before the Worms: lands can't enter once it's there.
    const bobs = lands(game, "Swamp", 3, B);
    const worms = spawn(game, "Worms of the Earth", A);
    pickModes(a);
    pickModes(b, 0);
    b.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 2);
    toStep(game, "draw", B);
    expect(bobs.filter((id) => zone(game, id) === "battlefield").length).toBe(1);
    expect(life(game, B)).toBe(20);
    expect(zone(game, worms)).toBe("graveyard");
  });
});
