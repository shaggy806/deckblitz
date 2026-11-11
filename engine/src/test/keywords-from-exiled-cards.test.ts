/**
 * "~ has flying as long as an exiled card used to craft it has flying. The same
 * is true for first strike, …, hexproof, …, protection, …" — the
 * `sharesKeywords` static: each listed keyword a card exiled with the source
 * has (rule 607.2a; craft's materials, 702.167c), every "hexproof from
 * [quality]" of theirs with hexproof (702.11d-e) and every protection ability
 * with protection (702.16a), for as long as that card stays exiled. Wretched
 * Bonemass, with Altar of the Wretched's own abilities.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import type { ScriptedController } from "../controller.js";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** Altar of the Wretched crafted with `materials` from alice's graveyard. */
function crafted(game: Game, a: ScriptedController, ...materials: readonly string[]): { bonemass: ObjectId; cards: ObjectId[] } {
  lands(game, "Swamp", 4);
  const altar = spawn(game, "Altar of the Wretched");
  const cards = materials.map((name) => toGraveyard(game, name));
  pickFromZone(a, ...cards);
  activate(game, altar, 0);
  expect(printedCardName(game.state.objects[altar])).toBe("Wretched Bonemass");
  for (const card of cards) expect(zone(game, card)).toBe("exile");
  return { bonemass: altar, cards };
}

describe("keywords of the exiled cards used to craft it", () => {
  it("has each listed keyword one of them has, and their total power as power and toughness", () => {
    const { game, a } = table();
    const { bonemass } = crafted(game, a, "Serra Angel", "White Knight", "Grizzly Bears");
    expect(pt(game, bonemass)).toEqual({ power: 8, toughness: 8 });
    const has = [...keywords(game, bonemass)];
    expect(has).toEqual(expect.arrayContaining(["flying", "vigilance", "first-strike"]));
    expect(has).not.toContain("trample");
    expect(has).not.toContain("hexproof");
  });

  it("only while that card stays exiled", () => {
    const { game, a } = table();
    const { bonemass, cards } = crafted(game, a, "Serra Angel", "Grizzly Bears");
    expect(keywords(game, bonemass)).toContain("flying");
    game.debugMove(cards[0], "graveyard");
    expect(keywords(game, bonemass)).not.toContain("flying");
    expect(pt(game, bonemass)).toEqual({ power: 2, toughness: 2 });
  });

  it("has their protection: White Knight's from black", () => {
    const { game, a } = table();
    const { bonemass } = crafted(game, a, "White Knight");
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const at = [{ kind: "object" as const, object: bonemass }];
    // Her own black spell can't target it; a red one can.
    expect(() => cast(game, toHand(game, "Murder"), { targets: at })).toThrow();
    cast(game, toHand(game, "Shock"), { targets: at });
    expect(zone(game, bonemass)).toBe("graveyard");
  });

  it("has their hexproof from a quality: Knight of Grace's from black", () => {
    const { game, a } = table();
    const { bonemass } = crafted(game, a, "Knight of Grace");
    expect(keywords(game, bonemass)).toContain("first-strike");
    const at = [{ kind: "object" as const, object: bonemass }];
    // Her own black spell can target it (rule 702.11d: only opponents' can't).
    lands(game, "Swamp", 3);
    const hers = toHand(game, "Murder");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: hers, targets: at })).toBeNull();
    // An opponent's black spell can't; their red one can.
    nextTurn(game);
    lands(game, "Swamp", 3, B);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Murder", B), { player: B, targets: at })).toThrow();
    cast(game, toHand(game, "Shock", B), { player: B, targets: at });
    expect(zone(game, bonemass)).toBe("graveyard");
  });
});

describe("Urborg Scavengers", () => {
  it("exiles a card from any graveyard, grows, and has that card's keywords", () => {
    const { game, a } = table();
    const angel = toGraveyard(game, "Serra Angel", B);
    pickTargets(a, angel);
    const scavengers = enter(game, "Urborg Scavengers");
    expect(zone(game, angel)).toBe("exile");
    expect(pt(game, scavengers)).toEqual({ power: 3, toughness: 3 });
    expect([...keywords(game, scavengers)]).toEqual(expect.arrayContaining(["flying", "vigilance"]));
    game.debugMove(angel, "graveyard");
    expect(keywords(game, scavengers)).not.toContain("flying");
  });

  it("has no protection from a card exiled with it: that isn't in its list", () => {
    const { game, a } = table();
    const knight = toGraveyard(game, "White Knight");
    pickTargets(a, knight);
    const scavengers = enter(game, "Urborg Scavengers");
    expect(keywords(game, scavengers)).toContain("first-strike");
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [{ kind: "object", object: scavengers }] });
    expect(zone(game, scavengers)).toBe("graveyard");
  });
});

describe("Altar of the Wretched", () => {
  it("may sacrifice a nontoken creature to draw and then mill its power", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    pickModes(a, 0);
    a.chooseSacrificesFn = () => [giant];
    enter(game, "Altar of the Wretched");
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 3);
    expect(graveyard(game)).toHaveLength(4);
  });

  it("offers no token to sacrifice", () => {
    const { game, a } = table();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    let offered: readonly ObjectId[] = [];
    pickModes(a, 0);
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [giant];
    };
    enter(game, "Altar of the Wretched");
    expect([...offered].sort()).toEqual([giant, bears].sort());
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("returns from the graveyard to its owner's hand for {2}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const altar = toGraveyard(game, "Altar of the Wretched");
    activate(game, altar, 1);
    expect(zone(game, altar)).toBe("hand");
  });
});
