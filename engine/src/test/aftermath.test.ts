/**
 * Aftermath (rule 702.127a): the aftermath half of a split card may be cast
 * from its owner's graveyard, can't be cast from any other zone, and a spell
 * cast from a graveyard is exiled whenever it would leave the stack — by
 * resolving, being countered, or going anywhere else (the rulings). With it,
 * exert as an activation cost (rule 701.43 — Hour of Devastation's "{T},
 * Exert this creature: …") and "each player shuffles their graveyard into
 * their library" (Survive).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** The faces `card` may be cast as right now, by route. */
const offers = (game: Game, card: ObjectId): string[] =>
  game
    .legalActions(A)
    .flatMap((a) => (a.kind === "cast-spell" && a.card === card ? [`${a.face ?? "-"}:${a.via ?? "hand"}`] : []));

describe("aftermath", () => {
  it("casts the first half from the hand and the aftermath half from the graveyard, then exiles it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Consign // Oblivion");
    expect(offers(game, card)).toEqual(["1:hand"]);

    cast(game, card, { face: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, card)).toBe("graveyard");
    expect(offers(game, card)).toEqual(["2:aftermath"]);

    const bobHand = hand(game, B).length;
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(B)] });
    expect(hand(game, B).length).toBe(bobHand - 2);
    expect(zone(game, card)).toBe("exile");
  });

  it("can't cast the aftermath half from the hand, or the other half from the graveyard by aftermath", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    lands(game, "Island", 2);
    const inHand = toHand(game, "Consign // Oblivion");
    expect(() => cast(game, inHand, { face: 2, targets: [ref(B)] })).toThrow(/graveyard/);
    const dead = toGraveyard(game, "Consign // Oblivion");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, dead, { face: 1, via: "aftermath", targets: [ref(bears)] })).toThrow(/aftermath/);
  });

  it("exiles an aftermath half cast from a graveyard that's countered, or returned to its owner's hand", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    lands(game, "Island", 6);
    const first = toGraveyard(game, "Consign // Oblivion");
    cast(game, first, { face: 2, via: "aftermath", targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Counterspell"), { targets: [ref(first)] });
    expect(zone(game, first)).toBe("exile");

    const second = toGraveyard(game, "Consign // Oblivion");
    cast(game, second, { face: 2, via: "aftermath", targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Remand"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("exile");
  });

  it("Survive: each player shuffles their graveyard into their library", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    const libraries = [A, B].map((p) => game.state.zones.perPlayer[p].library.length);
    const card = toGraveyard(game, "Struggle // Survive");
    cast(game, card, { face: 2, via: "aftermath" });
    expect(graveyard(game, A)).toEqual([]);
    expect(graveyard(game, B)).toEqual([]);
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraries[0] + 1);
    expect(game.state.zones.perPlayer[B].library.length).toBe(libraries[1] + 1);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("exert as a cost", () => {
  it("Steward of Solidarity makes a Warrior and stays tapped through its controller's next untap step", () => {
    const { game } = table();
    const steward = spawn(game, "Steward of Solidarity");
    activate(game, steward, 0);
    expect(tokensNamed(game, "Warrior Token (Vigilance)", A)).toBe(1);
    expect(game.state.objects[steward].exertedBy).toBe(A);
    nextTurn(game); // bob's
    nextTurn(game); // alice's: exerted, it doesn't untap
    expect(game.state.objects[steward].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game); // and the one after, it does
    expect(game.state.objects[steward].tapped).toBe(false);
  });

  it("Angel of Condemnation's exert ability exiles until it leaves", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const angel = spawn(game, "Angel of Condemnation");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    activate(game, angel, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(game.state.objects[angel].exertedBy).toBe(A);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(angel)]);
    settle(game);
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back.length).toBe(1);
  });

  it("Hope Tender's exert ability untaps two lands", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const tender = enter(game, "Hope Tender");
    const [x, y] = [spawn(game, "Forest", A, { tapped: true }), spawn(game, "Forest", A, { tapped: true })];
    activate(game, tender, 1, { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
  });
});
