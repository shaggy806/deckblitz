/**
 * Theme 10 of docs/plans/need-key-themes.md: one play-permission record, one
 * reader (`Game.playOptions`). A permission answers only "from there" (rule
 * 601.3); it dies with the card (400.7) and shows nothing it wouldn't (406.3).
 */
import { describe, expect, it } from "vitest";

import { POOL_CARDS, TOKEN_CARDS } from "../cards.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  nextTurn,
  pickFromZone,
  ref,
  setTurnTotal,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const offered = (game: Game, card: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => (a.kind === "cast-spell" || a.kind === "play-land") && a.card === card);

const REMOVED_KEYS = [
  "castFromGraveyard",
  "playFromGraveyard",
  "playFromLibraryTop",
  "castFromLibraryTop",
  "playFromExile",
  "playLandsFromGraveyard",
  "playFromHandOf",
  "castSelfFromGraveyard",
  "castFromGraveyardIf",
  "castSelfFromExile",
  "mayCast",
  "playable",
  "castOnly",
  "playedBy",
];
const REMOVED_KINDS = ["allow-cast-from-exile", "allow-cast-linked-exile", "grant-graveyard-cast"];
const TERMS = [
  "play",
  "filter",
  "spell",
  "free",
  "byPaying",
  "byPayingLife",
  "byDiscarding",
  "byPayingEnergy",
  "alsoPaying",
  "payLife",
  "sacrifice",
  "exileOthers",
  "exileFilter",
  "discard",
  "do",
  "costIncreasePerOther",
  "tax",
  "reduce",
  "undaunted",
  "spendAs",
  "oncePerTurn",
  "perType",
  "upTo",
  "yourTurnOnly",
  "gate",
  "sourceDid",
  "flash",
  "exileAfter",
  "gainsHaste",
  "landsEnterTapped",
  "entersWith",
];
const GRANT_EXTRAS = ["duration", "byOwner", "whileSource", "fromNextTurn"];

describe("the pool holds only the one vocabulary", () => {
  const all = [...POOL_CARDS, ...TOKEN_CARDS];
  const walk = (node: unknown, seen: (object: Record<string, unknown>, name: string) => void, name: string): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, seen, name);
    } else if (node !== null && typeof node === "object") {
      const object = node as Record<string, unknown>;
      seen(object, name);
      for (const value of Object.values(object)) walk(value, seen, name);
    }
  };
  const each = (seen: (object: Record<string, unknown>, name: string) => void): void => {
    for (const card of all) walk(card, seen, card.name);
  };

  it("no removed field or effect is left", () => {
    const bad: string[] = [];
    each((object, name) => {
      for (const key of REMOVED_KEYS) if (key in object) bad.push(`${name}: ${key}`);
      if (typeof object["kind"] === "string" && REMOVED_KINDS.includes(object["kind"])) bad.push(`${name}: ${object["kind"]}`);
    });
    expect(bad).toEqual([]);
  });

  it("every permission takes only the terms that are read (tsc doesn't excess-check card objects)", () => {
    const bad: string[] = [];
    const check = (terms: Record<string, unknown>, name: string, allowed: readonly string[], where: string): void => {
      for (const key of Object.keys(terms)) if (!allowed.includes(key)) bad.push(`${name}: ${where}.${key}`);
      // `cast-now`'s words: no store reads them.
      for (const key of ["byDiscarding", "byPayingEnergy", "alsoPaying"]) if (key in terms) bad.push(`${name}: ${where}.${key}`);
    };
    each((object, name) => {
      const permission = object["mayPlay"] as Record<string, unknown> | undefined;
      if (permission !== undefined && typeof permission === "object") {
        const allowed = "from" in permission
          ? [...TERMS, "from", "whose", "linked", "exiledByYou"]
          : [...TERMS, ...GRANT_EXTRAS];
        check(permission, name, allowed, "mayPlay");
      }
      if (object["kind"] === "impulse-exile") {
        check(object, name, [...TERMS, ...GRANT_EXTRAS, "kind", "amount", "whose", "whoseIf", "choose", "faceDown", "linked"], "impulse-exile");
      }
      if (object["kind"] === "grant-play") {
        check(object, name, [...TERMS, ...GRANT_EXTRAS, "kind", "cards", "to"], "grant-play");
      }
    });
    expect(bad).toEqual([]);
  });

  it("another player's hand is only reached with it revealed (402.3)", () => {
    const bad: string[] = [];
    each((object, name) => {
      const permission = object["mayPlay"] as Record<string, unknown> | undefined;
      if (permission?.["from"] === "hand" && object["handRevealed"] === undefined) bad.push(name);
    });
    expect(bad).toEqual([]);
  });
});

describe("a permission on the card", () => {
  it("Hex Magic: exiles the hand, draws that many, and plays them through the end of your next turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bolt = toHand(game, "Lightning Bolt");
    const forest = toHand(game, "Forest");
    const before = hand(game).length;
    cast(game, toHand(game, "Hex Magic"));
    settle(game);
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, forest)).toBe("exile");
    expect(hand(game).length).toBe(before);
    expect(offered(game, forest)).toBe(true);
    // Not past the end of your next turn: it's your next turn it goes through.
    nextTurn(game); // Bob's.
    nextTurn(game); // Alice's.
    expect(game.state.objects[forest].playPermission).toBeDefined();
    nextTurn(game);
    expect(game.state.objects[forest].playPermission).toBeUndefined();
  });

  it("goes with any move of the card (400.7)", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bolt = toLibrary(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "while-exiled" });
    settle(game);
    expect(game.state.objects[bolt].playPermission).toBeDefined();
    expect(offered(game, bolt)).toBe(true);
    cast(game, bolt, { via: "impulse", targets: [ref(B)] });
    settle(game);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.objects[bolt].playPermission).toBeUndefined();
  });

  it("a card exiled face down is reached only by a player who may look at it (406.3, 601.3f)", () => {
    const { game } = table();
    const bears = toExile(game, "Grizzly Bears", B);
    game.state.objects[bears].playPermission = { player: A, expiry: "permanent" };
    game.state.objects[bears].exiledFaceDown = { lookers: [], group: 1 };
    lands(game, "Forest", 2);
    expect(offered(game, bears)).toBe(false);
    game.state.objects[bears].exiledFaceDown = { lookers: [A], group: 1 };
    expect(offered(game, bears)).toBe(true);
  });
});

describe("a static's permission", () => {
  it("Assemble the Players: one creature spell a turn, off the top", () => {
    const { game } = table();
    spawn(game, "Assemble the Players");
    lands(game, "Plains", 6);
    const first = toLibrary(game, "Savannah Lions");
    expect(offered(game, first)).toBe(true);
    cast(game, first, { via: "library-top" });
    settle(game);
    expect(zone(game, first)).toBe("battlefield");
    const second = toLibrary(game, "Savannah Lions");
    expect(offered(game, second)).toBe(false);
    nextTurn(game);
    nextTurn(game);
    expect(offered(game, second)).toBe(true);
  });

  it("Assemble the Players: a new permanent is a new object with its own use (400.7)", () => {
    const { game } = table();
    const assemble = spawn(game, "Assemble the Players");
    lands(game, "Plains", 6);
    cast(game, toLibrary(game, "Savannah Lions"), { via: "library-top" });
    settle(game);
    const second = toLibrary(game, "Savannah Lions");
    expect(offered(game, second)).toBe(false);
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 } as EffectSpec, [ref(assemble)]);
    settle(game);
    expect(game.state.objects[assemble].playUses).toBeUndefined();
    enter(game, "Assemble the Players");
    expect(offered(game, second)).toBe(true);
  });

  it("Into the Pit: the top card costs a nonland permanent as well", () => {
    const { game, a } = table();
    spawn(game, "Into the Pit");
    lands(game, "Swamp", 3);
    const fodder = spawn(game, "Savannah Lions");
    const bolt = toLibrary(game, "Terror");
    const offer = game.legalActions(A).find((x) => x.kind === "cast-spell" && x.card === bolt);
    expect(offer?.kind === "cast-spell" && offer.sacrifice?.choices).toContain(fodder);
    void a;
  });

  it("Falco Spara: no counter to remove, no cast from the top", () => {
    const { game } = table();
    const falco = spawn(game, "Falco Spara, Pactweaver");
    game.state.objects[falco].counters = {};
    lands(game, "Forest", 3);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(offered(game, bears)).toBe(false);
    game.state.objects[falco].counters = { shield: 1 };
    expect(offered(game, bears)).toBe(true);
  });

  it("Evelyn: what she exiled, once a turn, spending any colour", () => {
    const { game } = table();
    enter(game, "Evelyn, the Covetous");
    settle(game);
    const exiled = game.state.zones.shared.exile.filter((id) => game.state.objects[id].counters?.collection === 1);
    expect(exiled.length).toBe(2);
    expect(offered(game, exiled[0])).toBe(true);
  });

  it("Overflow Submatrix: the artifact creature enters with a finality counter", () => {
    const { game } = table();
    spawn(game, "Overflow Submatrix");
    lands(game, "Swamp", 3);
    const ornithopter = toGraveyard(game, "Ornithopter");
    expect(offered(game, ornithopter)).toBe(true);
    cast(game, ornithopter, { via: "graveyard-permission" });
    settle(game);
    expect(zone(game, ornithopter)).toBe("battlefield");
    expect(counters(game, ornithopter, "finality")).toBe(1);
    expect(game.state.objects[ornithopter].controller).toBe(A);
  });
});

describe("Dawnhand Dissident: an additional cost that is an action", () => {
  const board = (): { game: Game; dissident: ObjectId; bears: ObjectId } => {
    const { game } = table();
    const dissident = spawn(game, "Dawnhand Dissident");
    const bears = toExile(game, "Grizzly Bears");
    game.state.objects[bears].exiledWith = { source: dissident, zoneChangeCount: game.state.objects[dissident].zoneChangeCount ?? 0 };
    lands(game, "Forest", 2);
    return { game, dissident, bears };
  };

  it("only with three counters to remove, and only your own card, on your turn", () => {
    const { game, dissident, bears } = board();
    expect(offered(game, bears)).toBe(false);
    game.state.objects[dissident].counters = { "-1/-1": 1 };
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[other].counters = { "+1/+1": 2 };
    expect(offered(game, bears)).toBe(true);
    const theirs = toExile(game, "Grizzly Bears", B);
    game.state.objects[theirs].exiledWith = game.state.objects[bears].exiledWith;
    expect(offered(game, theirs)).toBe(false);
    nextTurn(game);
    expect(offered(game, bears)).toBe(false);
  });

  it("casting it removes the three counters (601.2h)", () => {
    const { game, dissident, bears } = board();
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[other].counters = { "+1/+1": 3 };
    void dissident;
    cast(game, bears, { via: "impulse" });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, other, "+1/+1")).toBe(0);
  });
});

describe("a granted miracle", () => {
  const draw = (game: Game, player: PlayerId): void => {
    setTurnTotal(game.state, player, "card-drawn", 0);
    game.debugApplyEffect(player, { kind: "draw", amount: 1 });
    settle(game);
  };

  it("Lorehold: an instant in hand, drawn first, has miracle {2}", () => {
    const { game, a } = table();
    spawn(game, "Lorehold, the Historian");
    toLibrary(game, "Divination");
    let asked: string | undefined;
    a.revealMiracleFn = (_view, _card, cost) => {
      asked = cost;
      return false;
    };
    draw(game, A);
    expect(asked).toBe("{2}");
  });

  it("Lorehold: not a creature card, nor Molecule Man's a land", () => {
    const first = table();
    spawn(first.game, "Lorehold, the Historian");
    toLibrary(first.game, "Grizzly Bears");
    let asked = false;
    first.a.revealMiracleFn = () => {
      asked = true;
      return false;
    };
    draw(first.game, A);
    expect(asked).toBe(false);
    const second = table();
    spawn(second.game, "Molecule Man");
    toLibrary(second.game, "Forest");
    second.a.revealMiracleFn = () => {
      asked = true;
      return false;
    };
    draw(second.game, A);
    expect(asked).toBe(false);
  });
});

describe("Fiend of the Shadows", () => {
  it("what the damaged player exiles, you may play for as long as it's exiled", () => {
    const { game, a, b } = table();
    const land = toHand(game, "Forest", B);
    const fiend = spawn(game, "Fiend of the Shadows");
    pickFromZone(b, land);
    attack(game, a, [fiend]);
    settle(game);
    expect(zone(game, land)).toBe("exile");
    expect(game.state.objects[land].playPermission?.player).toBe(A);
    nextTurn(game);
    nextTurn(game);
    expect(offered(game, land)).toBe(true);
  });
});

describe("the view", () => {
  it("shows nothing of a permission but what the zones show", () => {
    const { game } = table();
    const bears = toExile(game, "Grizzly Bears", B);
    game.state.objects[bears].playPermission = { player: A, expiry: "permanent" };
    const view = viewFor(game.state, game.registry, B);
    expect(JSON.stringify(view)).not.toContain("playPermission");
  });
});
