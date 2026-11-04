/**
 * What an ability goes on to say about the token it made. "It gains haste" on
 * a token copy is an effect on the token, not a copy exception (Feldon of the
 * Third Path, whose copy is of a card in a graveyard); "create a token and
 * suspect it" is `for-each-permanent` over `thisWay: "created"` (Case of the
 * Stashed Skeleton, rule 701.60).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, keywords, lands, named, nextTurn, ref, settle, spawn, table, toGraveyard, toHand, toStep, tokensNamed, types, zone } from "./harness.js";

const FELDON = "Feldon of the Third Path";
const CASE = "Case of the Stashed Skeleton";
const SKELETON = "2/1 Black Skeleton Token";

const tokenOf = (game: Game, name: string): ObjectId => {
  const made = named(game, name, A).filter((id) => game.state.objects[id].isToken === true);
  expect(made).toHaveLength(1);
  return made[0];
};

describe("Feldon of the Third Path", () => {
  it("makes an artifact copy of the graveyard card, with haste, and sacrifices it at the next end step", () => {
    const { game } = table();
    const feldon = spawn(game, FELDON);
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    activate(game, feldon, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const token = tokenOf(game, "Grizzly Bears");
    expect(types(game, token)).toEqual(expect.arrayContaining(["creature", "artifact"]));
    expect(keywords(game, token).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield")).toHaveLength(0);
  });

  it("targets your own graveyard's creature cards only", () => {
    const { game } = table();
    const feldon = spawn(game, FELDON);
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const land = toGraveyard(game, "Forest");
    lands(game, "Mountain", 3);
    expect(() => activate(game, feldon, 0, { targets: [ref(theirs)] })).toThrow();
    expect(() => activate(game, feldon, 0, { targets: [ref(land)] })).toThrow();
  });

  it("every token a replacement adds has haste and is sacrificed (its ruling)", () => {
    const { game } = table();
    spawn(game, "Doubling Season");
    const feldon = spawn(game, FELDON);
    lands(game, "Mountain", 3);
    activate(game, feldon, 0, { targets: [ref(toGraveyard(game, "Grizzly Bears"))] });
    const made = named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield");
    expect(made.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    for (const id of made) expect(keywords(game, id).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A).filter((id) => game.state.objects[id].zone === "battlefield")).toHaveLength(0);
  });

  it("a copy of the token is an artifact, without the haste or the sacrifice (its ruling)", () => {
    const { game } = table();
    const feldon = spawn(game, FELDON);
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    activate(game, feldon, 0, { targets: [ref(bears)] });
    const token = tokenOf(game, "Grizzly Bears");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Rite of Replication"), { targets: [ref(token)] });
    const copy = named(game, "Grizzly Bears", A).find((id) => id !== token && game.state.objects[id].zone === "battlefield");
    expect(copy).toBeDefined();
    expect(types(game, copy!)).toContain("artifact");
    expect(keywords(game, copy!).has("haste")).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(zone(game, copy!)).toBe("battlefield");
  });
});

describe("Case of the Stashed Skeleton", () => {
  it("makes a 2/1 Skeleton that's suspected", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    cast(game, toHand(game, CASE));
    const skeleton = tokenOf(game, SKELETON);
    expect(game.state.objects[skeleton].suspectedAt).toBeDefined();
    expect(keywords(game, skeleton).has("menace")).toBe(true);
  });

  it("suspects only the tokens it made, every one of them", () => {
    const { game } = table();
    // An older one a stack would fold the new ones into.
    game.debugApplyEffect(A, { kind: "create-token", token: SKELETON, count: 1 }, []);
    spawn(game, "Doubling Season");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, CASE));
    expect(tokensNamed(game, SKELETON, A)).toBe(3);
    const count = (suspected: boolean): number =>
      named(game, SKELETON, A)
        .filter((id) => (game.state.objects[id].suspectedAt !== undefined) === suspected)
        .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(count(true)).toBe(2);
    expect(count(false)).toBe(1);
  });

  it("isn't solved while a suspected Skeleton stands; is once none does", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const hunted = toHand(game, CASE);
    cast(game, hunted);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hunted].solved).toBeFalsy();
    game.debugMove(tokenOf(game, SKELETON), "graveyard");
    nextTurn(game);
    nextTurn(game);
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hunted].solved).toBe(true);
  });

  it("solved, sacrifices for a tutor as a sorcery, and not before", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const hunted = spawn(game, CASE);
    expect(() => activate(game, hunted, 0)).toThrow();
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[hunted].solved).toBe(true);
    nextTurn(game);
    nextTurn(game);
    activate(game, hunted, 0, { settle: false });
    expect(zone(game, hunted)).toBe("graveyard");
  });
});
